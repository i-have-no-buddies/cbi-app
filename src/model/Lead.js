const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ngramsAlgo } = require('../utils/helper');

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

leadSchema.pre('insertMany', async (next, docs) => {
  for (const doc of docs) {
    doc.tags = [
      ...ngramsAlgo(
        `${doc.first_name.toLowerCase().trim()} ${doc.last_name
          .toLowerCase()
          .trim()}`,
        'tag'
      ),
      ...ngramsAlgo(doc.job_title.toLowerCase().trim(), 'tag'),
      ...ngramsAlgo(doc.company.toLowerCase().trim(), 'tag'),
      {
        tag: doc.gender.toLowerCase(),
      },
      {
        tag: doc.business_no.toLowerCase(),
      },
      {
        tag: doc.mobile.toLowerCase(),
      },
      {
        tag: doc.second_mobile.toLowerCase(),
      },
      {
        tag: doc.email.toLowerCase(),
      },
      { tag: doc.second_email.toLowerCase() },
      { tag: doc.nationality.toLowerCase() },
    ];
  }
});

leadSchema.plugin(mongoosePaginate);

<<<<<<< HEAD
leadSchema.index({ 'tags.tag': 1, _id: 1 });
=======
leadSchema.index({ 'tags.tag': 1, _id: 1 })
leadSchema.index({ lead_batch_id: 1, status: 1, 'tags.tag': 1 })
>>>>>>> b4fc9d0ee58a7738b9471a2793b0beabe4f2ad51

module.exports = {
  Lead: mongoose.model('Lead', leadSchema),
  LEAD_STATUS,
};
