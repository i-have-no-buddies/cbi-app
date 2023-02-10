const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { schemaTagsFormater, logDescriptionFormater } = require('../utils/helper');
const { LeadUpdateLog, LOG_TYPE } = require('../model/LeadUpdateLog');
const { User } = require('../model/User');

const HIERARCHY = {
  CANCELED: 'CANCELED',
  NEW: 'NEW',
  FIRST_MEETING: 'FIRST_MEETING',
  SECOND_MEETING: 'SECOND_MEETING',
  CLIENT: 'CLIENT',
}

const LEAD_STATUS = {
  NEW: 'NEW',
  FIRST_MEETING: 'FIRST_MEETING',
  SECOND_MEETING: 'SECOND_MEETING',
  EMAIL: 'EMAIL',
  WHATSAPP: 'WHATSAPP',
  SMS: 'SMS',
  MEETING: 'MEETING',
  CLIENT: 'CLIENT',
}

const OUTCOME = {
  MEETING_SAT: 'MEETING_SAT',
  NO_SHOW: 'NO_SHOW',
  CANCELED: 'CANCELED',
}

const EXCLUDED_FIELDS = [
  '_id',
  '__v',
  'lead_batch_id',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'tags',
  'hierarchy',
  'allocated_to',
  'uploaded_meeting',
];

const leadSchema = new mongoose.Schema({
  lead_batch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeadBatch',
  },
  first_name: {
    type: String,
    trim: true,
    default: '',
    set: function (first_name) {
      this.old_first_name = this.first_name;
      return first_name;
    },
  },
  last_name: {
    type: String,
    trim: true,
    default: '',
    set: function (last_name) {
      this.old_last_name = this.last_name;
      return last_name;
    },
  },
  nationality: {
    type: String,
    trim: true,
    default: '',
    set: function (nationality) {
      this.old_nationality = this.nationality;
      return nationality;
    },
  },
  country: {
    type: String,
    trim: true,
    default: '',
    set: function (country) {
      this.old_country = this.country;
      return country;
    },
  },
  city: {
    type: String,
    trim: true,
    default: '',
    set: function (city) {
      this.old_city = this.city;
      return city;
    },
  },
  job_title: {
    type: String,
    trim: true,
    default: '',
    set: function (job_title) {
      this.old_job_title = this.job_title;
      return job_title;
    },
  },
  company: {
    type: String,
    trim: true,
    default: '',
    set: function (company) {
      this.old_company = this.company;
      return company;
    },
  },
  profile_link: {
    type: String,
    trim: true,
    default: '',
    set: function (profile_link) {
      this.old_profile_link = this.profile_link;
      return profile_link;
    },
  },
  gender: {
    type: String,
    trim: true,
    default: '',
    set: function (gender) {
      this.old_gender = this.gender;
      return gender;
    },
  },
  business_no: {
    type: String,
    trim: true,
    default: '',
    set: function (business_no) {
      this.old_business_no = this.business_no;
      return business_no;
    },
  },
  mobile: {
    type: String,
    trim: true,
    default: '',
    set: function (mobile) {
      this.old_mobile = this.mobile;
      return mobile;
    },
  },
  second_mobile: {
    type: String,
    trim: true,
    default: '',
    set: function (second_mobile) {
      this.old_second_mobile = this.second_mobile;
      return second_mobile;
    },
  },
  personal_email: {
    type: String,
    trim: true,
    default: '',
    set: function (personal_email) {
      this.old_personal_email = this.personal_email;
      return personal_email;
    },
  },
  work_email: {
    type: String,
    trim: true,
    default: '',
    set: function (work_email) {
      this.old_work_email = this.work_email;
      return work_email;
    },
  },
  description: {
    type: String,
    trim: true,
    default: '',
    set: function (description) {
      this.old_description = this.description;
      return description;
    },
  },
  status: {
    type: String,
    default: LEAD_STATUS.NEW,
    set: function (status) {
      this.old_status = this.status;
      return status;
    },
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  hierarchy: {
    type: String,
    default: HIERARCHY.NEW
  },
  upload_date: {
    type: Date,
  },
  allocated_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  first_meeting: {
    type: Date,
  },
  second_meeting: {
    type: Date,
  },
  client: {
    type: Date,
  },
  uploaded_meeting: {},
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

leadSchema.pre('findOneAndUpdate', function (next) {
  next();
});

leadSchema.pre('save', async function (next) {
  let tags = []
  let name = `${this.first_name.trim()} ${this.last_name.trim()}`;
  tags = schemaTagsFormater(tags, name, 'name')
  tags = schemaTagsFormater(tags, this.job_title, 'job_title')
  tags = schemaTagsFormater(tags, this.company, 'company')
  tags = schemaTagsFormater(tags, this.business_no, 'contact')
  tags = schemaTagsFormater(tags, this.mobile, 'contact')
  tags = schemaTagsFormater(tags, this.second_mobile, 'contact')
  tags = schemaTagsFormater(tags, this.personal_email, 'email')
  tags = schemaTagsFormater(tags, this.work_email, 'email')
  tags = schemaTagsFormater(tags, this.nationality, 'nationality')
  tags = schemaTagsFormater(tags, this.status, 'status')
  tags = schemaTagsFormater(tags, this.hierarchy, 'hierarchy')
  tags = schemaTagsFormater(tags, this.upload_date, 'upload_date')
  tags = schemaTagsFormater(tags, this.allocated_to, 'allocated_to')
  this.tags = tags
  
  /**
   * logs
   */
  let previous = {};
  let current = {};
  let modified = [];
  const lead_update_log = new LeadUpdateLog();
  if (this.isNew) {
    for (const property in leadSchema.paths) {
      if (!EXCLUDED_FIELDS.includes(property)) {
        previous[property] = '';
        current[property] = this[property] || '';
        if (this[property]) {
          modified.push(property);
        }
      }
    }
  } else {
    for (const property in leadSchema.paths) {
      if (!EXCLUDED_FIELDS.includes(property)) {
        previous[property] = this[`old_${property}`] || '';
        current[property] = this[property] || '';
        if (this.isModified(property)) {
          modified.push(property);
        }
      }
    }
  }
  console.log(req)

  // //think of module
  if(this.updated_by) {
    let user = await User.findById(this.updated_by).lean()
    lead_update_log.log_type = this.isNew? LOG_TYPE.CREATE : LOG_TYPE.UPDATE
    lead_update_log.description = logDescriptionFormater(user, lead_update_log.log_type, 'Lead Information')
    lead_update_log.created_by = this.updated_by;
  }

  lead_update_log.lead_id = this['_id'],
  lead_update_log.current = current;
  lead_update_log.previous = previous;
  lead_update_log.modified = modified;
  await lead_update_log.save();
  next();
});


leadSchema.pre('insertMany', async function (next, docs) {
  for(doc of docs) {
    let tags = []
    let name = `${doc.first_name.trim()} ${doc.last_name.trim()}`;
    tags = schemaTagsFormater(tags, name, 'name')
    tags = schemaTagsFormater(tags, doc.job_title, 'job_title')
    tags = schemaTagsFormater(tags, doc.company, 'company')
    tags = schemaTagsFormater(tags, doc.business_no, 'contact')
    tags = schemaTagsFormater(tags, doc.mobile, 'contact')
    tags = schemaTagsFormater(tags, doc.second_mobile, 'contact')
    tags = schemaTagsFormater(tags, doc.personal_email, 'email')
    tags = schemaTagsFormater(tags, doc.work_email, 'email')
    tags = schemaTagsFormater(tags, doc.nationality, 'nationality')
    tags = schemaTagsFormater(tags, doc.status, 'status')
    tags = schemaTagsFormater(tags, doc.hierarchy, 'hierarchy')
    tags = schemaTagsFormater(tags, doc.upload_date, 'upload_date')
    tags = schemaTagsFormater(tags, doc.allocated_to, 'allocated_to')
    doc.tags = tags
  }
  next();
});


leadSchema.post('insertMany', async function (docs, next) {
  docs.forEach(async (doc) => {
    /**
     * logs
     */
    let previous = {};
    let current = {};
    let modified = [];
    
    for (const property in leadSchema.paths) {
      if (!EXCLUDED_FIELDS.includes(property)) {
        previous[property] = '';
        current[property] = doc[property] || '';
        if (doc[property]) {
          modified.push(property);
        }
      }
    }
    
    const lead_update_log = new LeadUpdateLog();
    //think of module
    if(doc.updated_by) {
      let user = await User.findById(doc.updated_by).lean()
      lead_update_log.log_type = LOG_TYPE.CREATE
      lead_update_log.description = logDescriptionFormater(user, LOG_TYPE.CREATE, 'Lead Information')
      lead_update_log.created_by = doc.updated_by;
    }

    lead_update_log.lead_id = doc['_id'],
    lead_update_log.current = current;
    lead_update_log.previous = previous;
    lead_update_log.modified = modified;
    await lead_update_log.save();
  });
});


leadSchema.index({ 'tags.tag': 1, _id: 1 });
leadSchema.index({ lead_batch_id: 1, 'tags.tag': 1 });
leadSchema.index({ allocated_to: 1, hierarchy: 1, 'tags.tag': 1 });

leadSchema.plugin(mongoosePaginate);

module.exports = {
  Lead: mongoose.model('Lead', leadSchema),
  HIERARCHY,
  LEAD_STATUS,
  OUTCOME,
}
