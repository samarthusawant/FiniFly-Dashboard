const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, 'finifly.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

app.use(express.json({ limit: '100kb' }));
app.use(session({
  name: 'finifly.sid',
  secret: process.env.SESSION_SECRET || 'replace-this-development-secret-before-deployment',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 60 * 60 * 1000 }
}));

db.exec(`
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS customers (
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, type TEXT NOT NULL,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS transactions (
 id INTEGER PRIMARY KEY AUTOINCREMENT, reference TEXT UNIQUE NOT NULL, customer_name TEXT NOT NULL,
 customer_type TEXT DEFAULT 'Customer', type TEXT NOT NULL, amount REAL NOT NULL CHECK(amount > 0),
 status TEXT NOT NULL, date TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
if (!userCount) {
  const hash = bcrypt.hashSync('Admin@123', 12);
  db.prepare('INSERT INTO users(email,password_hash,name) VALUES(?,?,?)').run('admin@finifly.local', hash, 'FiniFly Admin');
}
const customerCount = db.prepare('SELECT COUNT(*) AS n FROM customers').get().n;
if (!customerCount) {
  const seedCustomers = [
    ['Aditya Rao','aditya@example.com','Premium Client'],
    ['Neha Patil','neha@example.com','Gold Client'],
    ['Vikram Kulkarni','vikram@example.com','Business Client'],
    ['Priya Shah','priya@example.com','Premium Client'],
    ['Rahul Deshmukh','rahul@example.com','Retail Investor']
  ];
  const insert = db.prepare('INSERT INTO customers(name,email,type) VALUES(?,?,?)');
  seedCustomers.forEach(c => insert.run(...c));
}
const txCount = db.prepare('SELECT COUNT(*) AS n FROM transactions').get().n;
if (!txCount) {
  const seed = [
    ['FF-98241','Aditya Rao','Premium Client','Investment',240000,'Completed','2026-09-10'],
    ['FF-98240','Neha Patil','Gold Client','Withdrawal',85000,'Completed','2026-09-10'],
    ['FF-98239','Vikram Kulkarni','Business Client','Loan',520000,'Pending','2026-09-09'],
    ['FF-98238','Priya Shah','Premium Client','Payment',115000,'Completed','2026-09-09'],
    ['FF-98237','Rahul Deshmukh','Retail Investor','Investment',65000,'Completed','2026-09-08']
  ];
  const insert = db.prepare('INSERT INTO transactions(reference,customer_name,customer_type,type,amount,status,date) VALUES(?,?,?,?,?,?,?)');
  seed.forEach(t => insert.run(...t));
}

function requireAuth(req,res,next) {
  if (!req.session.user) return res.status(401).json({error:'Please sign in to continue.'});
  next();
}
function validDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)); }
function cleanString(v,max=100) { return typeof v === 'string' ? v.trim().slice(0,max) : ''; }

app.get('/api/health',(req,res)=>res.json({ok:true,service:'FiniFly API'}));
app.post('/api/login', async (req,res) => {
  const email=cleanString(req.body.email,120).toLowerCase();
  const password=typeof req.body.password==='string'?req.body.password:'';
  const user=db.prepare('SELECT id,email,password_hash,name FROM users WHERE email=?').get(email);
  if(!user || !(await bcrypt.compare(password,user.password_hash))) return res.status(401).json({error:'Invalid email or password.'});
  req.session.user={id:user.id,email:user.email,name:user.name};
  res.json({user:req.session.user});
});
app.get('/api/me',(req,res)=>res.json({user:req.session.user||null}));
app.post('/api/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));

app.get('/api/dashboard',requireAuth,(req,res)=>{
  const revenue=db.prepare("SELECT COALESCE(SUM(amount),0) n FROM transactions WHERE status='Completed' AND type!='Withdrawal'").get().n;
  const withdrawals=db.prepare("SELECT COALESCE(SUM(amount),0) n FROM transactions WHERE status='Completed' AND type='Withdrawal'").get().n;
  const customerCount=db.prepare('SELECT COUNT(*) n FROM customers').get().n;
  const profit=Math.round((revenue-withdrawals)*0.348);
  res.json({totalRevenue:Math.round(revenue),netProfit:profit,activeCustomers:customerCount,aum:Math.round((revenue+withdrawals)*3.1)});
});
app.get('/api/transactions',requireAuth,(req,res)=>{
  const q='%'+cleanString(req.query.search,100)+'%';
  res.json(db.prepare(`SELECT * FROM transactions WHERE customer_name LIKE ? OR reference LIKE ? OR type LIKE ? ORDER BY date DESC,id DESC`).all(q,q,q).map(t=>({...t,initials:t.customer_name.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase()})));
});
app.post('/api/transactions',requireAuth,(req,res)=>{
  const customer_name=cleanString(req.body.customer_name,80), type=cleanString(req.body.type,20), status=cleanString(req.body.status,20), amount=Number(req.body.amount), date=cleanString(req.body.date,10);
  if(!customer_name || !['Investment','Withdrawal','Loan','Payment'].includes(type) || !['Completed','Pending','Failed'].includes(status) || !Number.isFinite(amount) || amount<=0 || !validDate(date)) return res.status(400).json({error:'Please enter valid transaction details.'});
  const ref='FF-'+Date.now().toString().slice(-8);
  const customer=db.prepare('SELECT type FROM customers WHERE name=? COLLATE NOCASE').get(customer_name);
  const info=db.prepare('INSERT INTO transactions(reference,customer_name,customer_type,type,amount,status,date) VALUES(?,?,?,?,?,?,?)').run(ref,customer_name,customer?.type||'Customer',type,amount,status,date);
  res.status(201).json(db.prepare('SELECT * FROM transactions WHERE id=?').get(info.lastInsertRowid));
});
app.put('/api/transactions/:id',requireAuth,(req,res)=>{
  const id=Number(req.params.id), customer_name=cleanString(req.body.customer_name,80), type=cleanString(req.body.type,20), status=cleanString(req.body.status,20), amount=Number(req.body.amount), date=cleanString(req.body.date,10);
  if(!Number.isInteger(id)||!customer_name||!['Investment','Withdrawal','Loan','Payment'].includes(type)||!['Completed','Pending','Failed'].includes(status)||!Number.isFinite(amount)||amount<=0||!validDate(date)) return res.status(400).json({error:'Please enter valid transaction details.'});
  const result=db.prepare('UPDATE transactions SET customer_name=?,type=?,amount=?,status=?,date=? WHERE id=?').run(customer_name,type,amount,status,date,id);
  if(!result.changes)return res.status(404).json({error:'Transaction not found.'});
  res.json(db.prepare('SELECT * FROM transactions WHERE id=?').get(id));
});
app.delete('/api/transactions/:id',requireAuth,(req,res)=>{
  const result=db.prepare('DELETE FROM transactions WHERE id=?').run(Number(req.params.id));
  if(!result.changes)return res.status(404).json({error:'Transaction not found.'});
  res.json({ok:true});
});
app.get('/api/transactions/export.csv',requireAuth,(req,res)=>{
  const rows=db.prepare('SELECT reference,customer_name,type,amount,status,date FROM transactions ORDER BY date DESC').all();
  const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  const csv=['Reference,Customer,Type,Amount,Status,Date',...rows.map(r=>[r.reference,r.customer_name,r.type,r.amount,r.status,r.date].map(quote).join(','))].join('\r\n');
  res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition','attachment; filename="finifly-transactions.csv"');res.send('\uFEFF'+csv);
});
app.get('/api/customers',requireAuth,(req,res)=>res.json(db.prepare('SELECT * FROM customers ORDER BY id DESC').all()));
app.post('/api/customers',requireAuth,(req,res)=>{
  const name=cleanString(req.body.name,80),email=cleanString(req.body.email,120).toLowerCase(),type=cleanString(req.body.type,40);
  if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!['Retail Investor','Startup','Business','Institution'].includes(type))return res.status(400).json({error:'Enter a valid name, email and customer type.'});
  try{const info=db.prepare('INSERT INTO customers(name,email,type) VALUES(?,?,?)').run(name,email,type);res.status(201).json(db.prepare('SELECT * FROM customers WHERE id=?').get(info.lastInsertRowid));}
  catch(e){if(String(e.message).includes('UNIQUE'))return res.status(409).json({error:'A customer with this email already exists.'});throw e;}
});
app.get('/api/analytics',requireAuth,(req,res)=>{
  const year=Number(req.query.year)||new Date().getFullYear();
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const revenue=Array(12).fill(0),customers=Array(12).fill(0);
  const rows=db.prepare("SELECT CAST(strftime('%m',date) AS INTEGER) m, SUM(CASE WHEN type!='Withdrawal' THEN amount ELSE 0 END) revenue FROM transactions WHERE strftime('%Y',date)=? AND status='Completed' GROUP BY m").all(String(year));
  rows.forEach(r=>{revenue[r.m-1]=Math.round(r.revenue)});
  const custRows=db.prepare("SELECT CAST(strftime('%m',created_at) AS INTEGER) m,COUNT(*) n FROM customers WHERE strftime('%Y',created_at)=? GROUP BY m").all(String(year));
  custRows.forEach(r=>{customers[r.m-1]=r.n});
  const segments=db.prepare("SELECT type name, SUM(amount) total FROM transactions WHERE status='Completed' AND type!='Withdrawal' GROUP BY type").all();
  res.json({months,revenue,customers,segments});
});

app.use(express.static(path.join(__dirname,'public')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`FiniFly running at http://localhost:${PORT}`));
