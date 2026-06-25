const fs = require('fs');
const path = require('path');

async function testDB() {
  try {
    console.log('正在加载 sql.js...');
    const initSqlJs = await import('sql.js');
    console.log('sql.js 加载成功');
    
    const SQL = await initSqlJs.default();
    console.log('SQL 初始化成功');
    
    const db = new SQL.Database();
    console.log('数据库创建成功');
    
    db.run('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
    console.log('表创建成功');
    
    db.run('INSERT INTO test (name) VALUES (?)', ['test']);
    console.log('数据插入成功');
    
    const result = db.exec('SELECT * FROM test');
    console.log('查询结果:', result);
    
    const data = db.export();
    fs.writeFileSync('./test.sqlite', Buffer.from(data));
    console.log('数据库保存成功');
    
    db.close();
    console.log('测试完成!');
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

testDB();
