const fs = require('fs');

const data = JSON.parse(fs.readFileSync('success.json'));
// console.log(data);
let contacts = [];
data.forEach(({accountNo, emails}) => {
  // console.log(emails, accountNo)
  const contactObj = emails.map(email => ({ accountNo, email }))
  console.log(contactObj)
  contacts = contacts.concat(contactObj)
});
fs.writeFileSync('contacts.json', JSON.stringify(contacts, undefined, 4));