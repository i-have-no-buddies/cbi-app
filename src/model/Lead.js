const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ngramsAlgov2 } = require('../utils/helper');

const LEAD_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

const leadSchema = new mongoose.Schema({
  lead_batch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeadBatch',
  },
  first_name: {
    type: String,
    trim: true,
  },
  last_name: {
    type: String,
    trim: true,
  },
  job_title: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  profile_link: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    trim: true,
  },
  business_no: {
    type: String,
    trim: true,
  },
  mobile: {
    type: String,
    trim: true,
  },
  second_mobile: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  second_email: {
    type: String,
    trim: true,
  },
  nationality: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    default: LEAD_STATUS.ACTIVE,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  tags: {
    type: [
      {
        _id: false,
        tag: {
          type: String,
        },
      },
    ],
  },
});

leadSchema.pre('save', async function () {
  const doc = this;
  let name = `${doc.first_name.trim()} ${doc.last_name.trim()}`;
  doc.tags = [
    ...ngramsAlgov2(name.toLowerCase(), 'name'),
    ...ngramsAlgov2(doc.job_title.toLowerCase().trim(), 'job_title'),
    ...ngramsAlgov2(doc.company.toLowerCase().trim(), 'company'),
    // ...ngramsAlgov2(doc.gender.toLowerCase().trim(), 'gender'),
    // ...ngramsAlgov2(doc.business_no.toLowerCase().trim(), 'business_no'),
    ...ngramsAlgov2(doc.mobile.toLowerCase().trim(), 'mobile'),
    //...ngramsAlgov2(doc.second_mobile.toLowerCase().trim(), 'second_mobile'),
    ...ngramsAlgov2(doc.email.toLowerCase().trim(), 'email'),
    // ...ngramsAlgov2(doc.second_email.toLowerCase().trim(), 'second_email'),
    // ...ngramsAlgov2(doc.nationality.toLowerCase().trim(), 'nationality'),
    ...ngramsAlgov2(doc.status.toLowerCase().trim(), 'status'),
  ];
});

leadSchema.pre('insertMany', async (next, docs) => {
  for (const doc of docs) {
    let name = `${doc.first_name.trim()} ${doc.last_name.trim()}`;
    doc.tags = [
      ...ngramsAlgov2(name.toLowerCase(), 'name'),
      ...ngramsAlgov2(doc.job_title.toLowerCase().trim(), 'job_title'),
      ...ngramsAlgov2(doc.company.toLowerCase().trim(), 'company'),
      // ...ngramsAlgov2(doc.gender.toLowerCase().trim(), 'gender'),
      // ...ngramsAlgov2(doc.business_no.toLowerCase().trim(), 'business_no'),
      ...ngramsAlgov2(doc.mobile.toLowerCase().trim(), 'mobile'),
      //...ngramsAlgov2(doc.second_mobile.toLowerCase().trim(), 'second_mobile'),
      ...ngramsAlgov2(doc.email.toLowerCase().trim(), 'email'),
      // ...ngramsAlgov2(doc.second_email.toLowerCase().trim(), 'second_email'),
      // ...ngramsAlgov2(doc.nationality.toLowerCase().trim(), 'nationality'),
      ...ngramsAlgov2(doc.status.toLowerCase().trim(), 'status'),
    ];
  }
});

leadSchema.index({ 'tags.tag': 1, _id: 1 });
leadSchema.index({ lead_batch_id: 1, 'tags.tag': 1 });

leadSchema.plugin(mongoosePaginate);

module.exports = {
  Lead: mongoose.model('Lead', leadSchema),
  LEAD_STATUS,
};
