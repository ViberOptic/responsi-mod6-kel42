import { pool } from '../config/db.js';

export const LoanModel = {
  async createLoan(book_id, member_id, due_date) {
    const client = await pool.connect(); 
    try {
      await client.query('BEGIN'); 

      const bookCheck = await client.query('SELECT available_copies FROM books WHERE id = $1', [book_id]);
      if (bookCheck.rows.length === 0) {
        throw new Error('Buku tidak ditemukan.');
      }
      if (bookCheck.rows[0].available_copies <= 0) {
        throw new Error('Buku sedang tidak tersedia (stok habis).');
      }

      await client.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = $1', [book_id]);

      const loanQuery = `
        INSERT INTO loans (book_id, member_id, due_date) 
        VALUES ($1, $2, $3) RETURNING *
      `;
      const result = await client.query(loanQuery, [book_id, member_id, due_date]);

      await client.query('COMMIT'); 
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK'); 
      throw error;
    } finally {
      client.release();
    }
  },

  async getAllLoans() {
    const query = `
      SELECT l.*, b.title as book_title, m.full_name as member_name 
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN members m ON l.member_id = m.id
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // FUNGSI YANG DIUBAH: Mendapatkan Top 3 Peminjam dengan Nested JSON
  async getTopBorrowers() {
    const query = `
      WITH MemberLoanCounts AS (
          SELECT member_id, COUNT(id) as total_loans, MAX(loan_date) as last_loan_date
          FROM loans
          GROUP BY member_id
      ),
      RankedBooks AS (
          SELECT l.member_id, b.title, COUNT(l.id) as borrow_count,
                 ROW_NUMBER() OVER(PARTITION BY l.member_id ORDER BY COUNT(l.id) DESC, MAX(l.loan_date) DESC) as rn
          FROM loans l
          JOIN books b ON l.book_id = b.id
          GROUP BY l.member_id, b.title
      )
      SELECT 
          m.id AS member_id,
          m.full_name,
          m.email,
          m.member_type,
          mlc.total_loans::INTEGER,
          mlc.last_loan_date,
          rb.title AS favorite_book_title,
          rb.borrow_count::INTEGER AS times_borrowed
      FROM MemberLoanCounts mlc
      JOIN members m ON mlc.member_id = m.id
      JOIN RankedBooks rb ON mlc.member_id = rb.member_id AND rb.rn = 1
      ORDER BY mlc.total_loans DESC
      LIMIT 3;
    `;
    const result = await pool.query(query);
    
    // Mapping raw data dari database ke format JSON yang diinginkan (Nested Object)
    return result.rows.map(row => ({
      member_id: row.member_id,
      full_name: row.full_name,
      email: row.email,
      member_type: row.member_type,
      total_loans: row.total_loans,
      last_loan_date: row.last_loan_date,
      favorite_book: {
        title: row.favorite_book_title,
        times_borrowed: row.times_borrowed
      }
    }));
  }
};