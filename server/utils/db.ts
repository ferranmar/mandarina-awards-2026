import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { nanoid } from 'nanoid'


const DB_PATH = process.env.DB_PATH || './data/premios.db'
mkdirSync(dirname(resolve(DB_PATH)), { recursive: true })

export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS nominees (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS voters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS votes (
  category_id TEXT NOT NULL,
  voter_id TEXT NOT NULL,
  nominee_id TEXT NOT NULL,
  PRIMARY KEY (category_id, voter_id)
);
`)

const DEFAULT_CANDIDATES = ['Emilio', 'Ferri', 'Pere', 'Rasse', 'Biel', 'Carlos', 'Cesc', 'Dani', 'Eloy', 'Hugo', 'Ivan', 'Joel', 'Oscar']

const DEFAULT_CATEGORIES = [
  { categoria: 'Chófer del año', candidatos: DEFAULT_CANDIDATES },
  { categoria: 'Infiel del año', candidatos: DEFAULT_CANDIDATES },
  { categoria: 'Correada del año', candidatos: DEFAULT_CANDIDATES },
  { categoria: 'Golden Mandarin', candidatos: DEFAULT_CANDIDATES },
  { categoria: 'Pana del año', candidatos: DEFAULT_CANDIDATES },
  { categoria: 'Revelación del año', candidatos: DEFAULT_CANDIDATES },
  { categoria: 'Borracho del año', candidatos: DEFAULT_CANDIDATES },
  { categoria: 'Guarrada del año', candidatos: DEFAULT_CANDIDATES },
  { categoria: 'Gymbro del año', candidatos: DEFAULT_CANDIDATES },
  { categoria: 'Panan\'t del año', candidatos: DEFAULT_CANDIDATES },
  { categoria: 'Multimedia del año', candidatos: DEFAULT_CANDIDATES },
  { categoria: 'Mandarina de oro', candidatos: DEFAULT_CANDIDATES },
];

function seedDefaultCategories() {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  
  if (count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (id, name, status, position) VALUES (?, ?, ?, ?)');
    const insertNominee = db.prepare('INSERT INTO nominees (id, category_id, name) VALUES (?, ?, ?)');

    const seed = db.transaction((categories: typeof DEFAULT_CATEGORIES) => {
      categories.forEach((item, index) => {
        const categoryId = nanoid();
        insertCategory.run(categoryId, item.categoria, 'open', index);
        item.candidatos.forEach((candidateName) => {
          insertNominee.run(nanoid(), categoryId, candidateName);
        });
      });
    });
    seed(DEFAULT_CATEGORIES);
  }
}
seedDefaultCategories()

export function getFullState(): { categories: Category[] } {
  const categories = db.prepare('SELECT id, name, status FROM categories ORDER BY position ASC').all() as any[]
  const nomineesStmt = db.prepare('SELECT id, name FROM nominees WHERE category_id = ?')
  const tallyStmt = db.prepare('SELECT nominee_id, COUNT(*) as count FROM votes WHERE category_id = ? GROUP BY nominee_id')
  const totalStmt = db.prepare('SELECT COUNT(*) as total FROM votes WHERE category_id = ?')

  const fullCategories = categories.map((cat) => {
    const nominees = nomineesStmt.all(cat.id) as { id: string, name: string }[]
    const tallyRows = tallyStmt.all(cat.id) as { nominee_id: string, count: number }[]
    const total = (totalStmt.get(cat.id) as any).total as number
    const counts: Record<string, number> = {}
    nominees.forEach(n => { counts[n.id] = 0 })
    tallyRows.forEach(r => { counts[r.nominee_id] = r.count })
    return { ...cat, nominees, counts, total }
  })

  return {categories: fullCategories }
}
