// Uso: node scripts/crear-admin.js <usuario> <contraseña>
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Admin, sequelize } = require('../../models');

async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    throw new Error('Uso: node scripts/crear-admin.js <usuario> <contraseña>');
  }

  const password_hash = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ username, password_hash });
  console.log(`Admin creado: ${admin.username} (id ${admin.id})`);
}

main()
  .catch((err) => {
    console.error(err.name === 'SequelizeUniqueConstraintError'
      ? 'Ya existe un admin con ese usuario'
      : err.message);
  })
  .finally(() => sequelize.close());