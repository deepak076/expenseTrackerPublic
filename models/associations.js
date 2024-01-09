// C:\Users\DEEPSROCK\Desktop\node-js\Expense tracker\models\associations.js
const User = require('./users');
const DownloadedFile = require('./downloadFiles');

// Define the association
User.hasMany(DownloadedFile, { foreignKey: 'user_id' });
DownloadedFile.belongsTo(User, { foreignKey: 'user_id' });
