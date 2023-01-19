const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ngramsAlgov2, logDescriptionFormater } = require('../utils/helper');
const { LeadUpdateLog, LOG_TYPE } = require('../model/LeadUpdateLog');
const { User } = require('../model/User');


const LEAD_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
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
    default: LEAD_STATUS.ACTIVE,
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

leadSchema.pre('save', async function (next) {

  this.tags = [];
  let name = `${this.first_name.trim()} ${this.last_name.trim()}`;
  if (name) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(name.toLowerCase(), 'name'),
    ];
  }
  if (this.job_title) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.job_title.toLowerCase(), 'job_title'),
    ];
  }
  if (this.company) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.company.toLowerCase(), 'company'),
    ];
  }
  if (this.business_no) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.business_no.toLowerCase(), 'contact'),
    ];
  }
  if (this.mobile) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.mobile.toLowerCase(), 'contact'),
    ];
  }
  if (this.second_mobile) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.second_mobile.toLowerCase(), 'contact'),
    ];
  }
  if (this.personal_email) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.personal_email.toLowerCase(), 'email'),
    ];
  }
  if (this.work_email) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.work_email.toLowerCase(), 'email'),
    ];
  }
  if (this.nationality) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.nationality.toLowerCase(), 'nationality'),
    ];
  }
  if (this.status) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.status.toLowerCase(), 'status'),
    ];
  }

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

  
  // //think of module
  if(this.updated_by) {
    let user = await User.findById(this.updated_by).lean()
    lead_update_log.log_type = this.isNew? LOG_TYPE.CREATE : LOG_TYPE.UPDATE
    lead_update_log.description = logDescriptionFormater(user, log_type, 'Lead Information')
    lead_update_log.created_by = this.updated_by;
  }

  lead_update_log.lead_id = this['_id'],
  lead_update_log.current = current;
  lead_update_log.previous = previous;
  lead_update_log.modified = modified;
  await lead_update_log.save();
  next();
});

leadSchema.index({ 'tags.tag': 1, _id: 1 });
leadSchema.index({ lead_batch_id: 1, 'tags.tag': 1 });

leadSchema.plugin(mongoosePaginate);

module.exports = {
  Lead: mongoose.model('Lead', leadSchema),
  LEAD_STATUS,
  OUTCOME,
}
