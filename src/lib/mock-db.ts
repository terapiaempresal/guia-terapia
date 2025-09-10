// Mock database para desenvolvimento sem Supabase
let mockData: { [key: string]: any[] } = {};

export class MockDB {
    private static getKey(table: string): string {
        return `mock_db_${table}`;
    }

    private static isClient() {
        return typeof window !== 'undefined';
    }

    private static getData(table: string): any[] {
        const key = this.getKey(table);

        if (this.isClient()) {
            // No cliente, usar localStorage
            return JSON.parse(localStorage.getItem(key) || '[]');
        } else {
            // No servidor, usar variável em memória
            return mockData[key] || [];
        }
    }

    private static setData(table: string, data: any[]) {
        const key = this.getKey(table);

        if (this.isClient()) {
            // No cliente, usar localStorage
            localStorage.setItem(key, JSON.stringify(data));
        } else {
            // No servidor, usar variável em memória
            mockData[key] = data;
        }
    }

    static async insert(table: string, data: any) {
        try {
            const existing = this.getData(table);
            const newRecord = {
                id: Date.now().toString(),
                created_at: new Date().toISOString(),
                ...data
            };
            existing.push(newRecord);
            this.setData(table, existing);
            return { data: newRecord, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    static async select(table: string, filter?: any) {
        try {
            const data = this.getData(table);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    static async update(table: string, id: string, data: any) {
        try {
            const existing = this.getData(table);
            const index = existing.findIndex((item: any) => item.id === id);
            if (index >= 0) {
                existing[index] = { ...existing[index], ...data, updated_at: new Date().toISOString() };
                this.setData(table, existing);
                return { data: existing[index], error: null };
            }
            return { data: null, error: 'Record not found' };
        } catch (error) {
            return { data: null, error };
        }
    }
}
