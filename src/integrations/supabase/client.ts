
import { pool, query, auth, checkDatabaseConnection } from '@/lib/supabase';

// Exportar as funções principais com interface similar ao Supabase
export const database = {
  from: (table: string) => ({
    select: async (columns = '*', options?: any) => {
      try {
        const result = await query(`SELECT ${columns} FROM ${table}`);
        return { data: result.rows, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    
    insert: async (data: any) => {
      try {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        
        const result = await query(`
          INSERT INTO ${table} (${keys.join(', ')})
          VALUES (${placeholders})
          RETURNING *
        `, values);
        
        return { data: result.rows, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    
    update: async (data: any) => ({
      eq: async (column: string, value: any) => {
        try {
          const keys = Object.keys(data);
          const values = Object.values(data);
          const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
          
          const result = await query(`
            UPDATE ${table}
            SET ${setClause}
            WHERE ${column} = $${keys.length + 1}
            RETURNING *
          `, [...values, value]);
          
          return { data: result.rows, error: null };
        } catch (error) {
          return { data: null, error };
        }
      }
    }),
    
    delete: () => ({
      eq: async (column: string, value: any) => {
        try {
          const result = await query(`
            DELETE FROM ${table}
            WHERE ${column} = $1
            RETURNING *
          `, [value]);
          
          return { data: result.rows, error: null };
        } catch (error) {
          return { data: null, error };
        }
      }
    })
  }),
  
  rpc: async (functionName: string, params?: any) => {
    // Implementar funções RPC conforme necessário
    console.log(`RPC function ${functionName} called with params:`, params);
    return { data: null, error: { message: 'RPC functions not implemented yet' } };
  }
};

export const supabase = {
  from: database.from,
  auth,
  rpc: database.rpc
};

export { checkDatabaseConnection };
