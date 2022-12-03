require('../config/mongodb');
const { User, USER_TYPE, USER_STATUS } = require('../model/User');
const { Lead } = require('../model/Lead');
const { LeadBatch } = require('../model/LeadBatch');
const { BdmSetting } = require('../model/BdmSetting');
const {
  randUser,
  rand,
  randFootballTeam,
  randJobTitle,
  randCompanyName,
} = require('@ngneat/falso');

async function seed() {
  await User.deleteMany({});
  await Lead.deleteMany({});
  await LeadBatch.deleteMany({});
  await BdmSetting.deleteMany({});

  let users = [
    {
      first_name: 'Ejer',
      last_name: 'Luna',
      email: 'ejer@email.com',
      password: '123456',
      type: USER_TYPE.SUPER_ADMIN,
      status: USER_STATUS.ACTIVE,
    },
    {
      first_name: 'Marvin',
      last_name: 'Villegas',
      email: 'marvin@email.com',
      password: '123456',
      type: USER_TYPE.SUPER_ADMIN,
      status: USER_STATUS.ACTIVE,
    },
  ];
  for (let i = 1; i <= 100; i++) {
    let user = randUser();
    users.push({
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      password: '123456',
      type: rand(Object.values(USER_TYPE)),
      status: rand(Object.values(USER_STATUS)),
    });
  }
  await User.insertMany(users, { ordered: false });

  let leads = [];
  for (let i = 1; i <= 10; i++) {
    const leadBatch = new LeadBatch({
      upload_name: randFootballTeam(),
    });
    await leadBatch.save();
    for (let j = 1; j <= rand([10, 20, 30]); j++) {
      let lead = randUser();
      leads.push({
        lead_batch_id: leadBatch._id,
        first_name: lead.firstName,
        last_name: lead.lastName,
        job_title: randJobTitle(),
        company: randCompanyName(),
        mobile: lead.phone,
        email: lead.email,
      });
    }
    await Lead.insertMany(leads, { ordered: false });
  }
  process.exit();
}

seed();
