import { getDates } from '../utils/dateUtils';
import { TodoItem } from '../types/types';

export class TodoService {
  constructor(private conn: any) {}

  async getTodosByTarget(userId?: string, target?: 'yesterday' | 'today'): Promise<TodoItem[]> {
    const dates = getDates();
    const targetDate = target ? dates[target] : null;

    let query = 'SELECT * FROM Todo';
    const params: (string | number)[] = [];

    if (userId || targetDate) {
      query += ' WHERE';
      if (userId) {
        query += ' user_id = ?';
        params.push(parseInt(userId, 10));
      }
      if (targetDate) {
        if (userId) query += ' AND';
        query += ' DATE(start_date) = ?';
        params.push(targetDate);
      }
    }

    const rows = await this.conn.query(query, params);

    return rows.sort((a: TodoItem, b: TodoItem) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      return Number(a.is_completed) - Number(b.is_completed) || dateA.getTime() - dateB.getTime();
    });
  }

  async addTodo({
    user_id,
    title,
    start_date,
    end_date,
    memo,
    category_id,
  }: {
    user_id: number | null;
    title: string;
    start_date: string;
    end_date: string;
    memo: string;
    category_id?: number | null;
  }) {
    const validCategoryId = await this.validateCategoryId(category_id);

    await this.conn.query(
      'INSERT INTO Todo (user_id, title, start_date, end_date, memo, category_id) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, title, start_date, end_date, memo, validCategoryId === 0 ? null : validCategoryId]
    );
  }

  private async validateCategoryId(categoryId?: number | null): Promise<number | null> {
    if (categoryId == null || categoryId === 0) return null;
    const [category] = await this.conn.query('SELECT id FROM Categories WHERE id = ?', [
      categoryId,
    ]);
    return category ? categoryId : null;
  }

  async updateTodo(body: { [key: string]: string }, id: number) {
    const makeSQL = Object.keys(body)
      .map(key => `${key} = ?`)
      .join(', ');

    await this.conn.query(`UPDATE Todo SET ${makeSQL} WHERE id = ?`, [Object.values(body), id]);
  }

  async deleteTodo(id: string) {
    const [rows] = await this.conn.query('SELECT * FROM Todo WHERE id = ?', [id]);

    if (rows.length === 0) {
      return { success: false, message: '일치하는 데이터가 없습니다.' };
    }

    await this.conn.query('DELETE FROM Todo WHERE id = ?', [id]);
    return { success: true };
  }

  async checkTodo(id: number) {
    const rows = await this.conn.query('SELECT * FROM Todo WHERE id = ?', [id]);

    if (!rows || rows.length === 0) return false;

    const currentTodo = rows[0];
    const newIsCompleted = !currentTodo.is_completed;

    await this.conn.query('UPDATE Todo SET is_completed = ? WHERE id = ?', [newIsCompleted, id]);

    return true;
  }

  async getCompletedTodos() {
    const result = await this.conn.query(
      'SELECT * FROM Todo WHERE is_completed = true AND category_id IS NOT NULL'
    );
    return result;
  }
}
