const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')
const mongoosePaginate = require('mongoose-paginate-v2')
const { schemaTagsFormater, logDescriptionFormater } = require('../utils/helper');
const { LeadUpdateLog, LOG_TYPE } = require('../model/LeadUpdateLog');
const { Lead, HIERARCHY, LEAD_STATUS, OUTCOME, MODULE_PAGES } = require('../model/Lead');
const { User } = require('../model/User');


const PRODUCTS = {
  CBI: 'CBI',
  PROPERTY: 'PROPERTY',
}
const PROGRAMS = {
  UK_PROPERTY: 'UK Property',
  GERMANY_PROPERTY: 'Germany property',
  US_PROPERTY: 'US property',
  UK_INNOVATOR: 'UK Innovator',
  PORTUGAL_GV: 'Portugal GV',
  GREECE_PR: 'Greece PR',
  MALTA_PR: 'Malta PR',
  MALTA_PP: 'Malta PP',
  SPAIN: 'Spain',
  TURKEY: 'Turkey',
  GRENADA: 'Grenada',
  ST_LUCIA: 'St Lucia',
  ST_KITTS: 'St Kitts',
  DOMINICA: 'Dominica',
  ANTIGUA: 'Antigua',
  US_EB5: 'US EB5',
  US_E2: 'US E2',
  US_EB3: 'US EB3'
}


const LEAD_SCHEMA = [
  'first_name',
  'last_name',
  'status',
];

const EXCLUDED_FIELDS = [
  '_id',
  '__v',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
];

const statusLogSchema = new mongoose.Schema({
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
  lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  status_log: {
    type: String,
    required: true,
    default: '',
    set: function (status_log) {
      this.old_status_log = this.status_log;
      return status_log;
    },
  },
  note: {
    type: String,
    required: true,
    default: '',
    set: function (note) {
      this.old_note = this.note;
      return note;
    },
  },
  datetime: {
    type: Date,
    default: '',
    set: function (datetime) {
      this.old_datetime = this.datetime;
      return datetime;
    },
  },
  address: {
    type: String,
    default: '',
    set: function (address) {
      this.old_address = this.address;
      return address;
    },
  },
  meeting_time: {
    type: String,
    default: '',
  },
  is_first_meeting: {
    type: Boolean,
    default: false,
    set: function (is_first_meeting) {
      this.old_is_first_meeting = this.is_first_meeting;
      return is_first_meeting;
    },
  },
  is_second_meeting: {
    type: Boolean,
    default: false,
    set: function (is_second_meeting) {
      this.old_is_second_meeting = this.is_second_meeting;
      return is_second_meeting;
    },
  },
  product: {
    type: String,
    default: '',
    set: function (product) {
      this.old_product = this.product;
      return product;
    },
  },
  program: {
    type: String,
    default: '',
    set: function (program) {
      this.old_program = this.program;
      return program;
    },
  },
  outcome: {
    type: String,
    default: '',
    set: function (outcome) {
      this.old_outcome = this.outcome;
      return outcome;
    },
  },
  outcome_note: {
    type: String,
    default: '',
    set: function (outcome_note) {
      this.old_outcome_note = this.outcome_note;
      return outcome_note;
    },
  },
  outcome_date: {
    type: Date,
    default: '',
    set: function (outcome_date) {
      this.old_outcome_date = this.outcome_date;
      return outcome_date;
    },
  },
  action_page: {
    type: String,
    trim: true,
    default: '',
    set: function (action_page) {
      this.old_action_page = this.action_page;
      return action_page;
    },
  },
})


statusLogSchema.pre('save', async function (next) {  
  //used for initial meeting
  const options = this.$__.saveOptions;
  let manual = options.uploaded ? false : true;
  /**
   * logs
   */
  let previous = {};
  let current = {};
  let modified = [];
  const lead_update_log = new LeadUpdateLog();

  
  //add the lead to the lead update logs
  const lead = await Lead.findById(this['lead_id']).lean();
  LEAD_SCHEMA.forEach(property => {
    previous[property] = lead[property] || '';
    current[property] = lead[property] || '';
    if (property == 'status' && manual) {
      modified.push(property);
      current[property] = this['status_log'] || '';
    } 
  });

  if (this.isNew) {
    for (const property in statusLogSchema.paths) {
      if (!EXCLUDED_FIELDS.includes(property)) {
        previous[property] = '';
        current[property] = this[property] || '';
        if (this[property]) {
          modified.push(property);
        }
      }
    }
  } else {
    for (const property in statusLogSchema.paths) {
      if (!EXCLUDED_FIELDS.includes(property)) {
        previous[property] = this[`old_${property}`] || '';
        current[property] = this[property] || '';
        if (this.isModified(property)) {
          modified.push(property);
        }
      }
    }
  }
  
  //triggered when user namunaly updates not using uploader
  if(manual) {
    //update the lead
    let tag_status = this['status_log'].toLowerCase()
    let new_lead_status = this['status_log']

    //Hierarchy First meeting
    if(lead.hierarchy == HIERARCHY.NEW) {  
      if(this['outcome'] == OUTCOME.CANCELED) {
        //what to do if canceled
        lead.hierarchy = 'CANCELED'
      }
      else if(this.is_first_meeting == true && lead.first_meeting == undefined) {
        tag_status = LEAD_STATUS.FIRST_MEETING.toLowerCase()
        new_lead_status = LEAD_STATUS.FIRST_MEETING
        
        lead.first_meeting = new Date()
        lead.hierarchy = HIERARCHY.FIRST_MEETING
      }
    }

    //Hierarchy Second meeting
    if(lead.hierarchy == HIERARCHY.FIRST_MEETING) { 
      if(this.is_second_meeting == true && lead.second_meeting == undefined) {
        tag_status = LEAD_STATUS.SECOND_MEETING.toLowerCase()
        new_lead_status = LEAD_STATUS.SECOND_MEETING

        lead.second_meeting = new Date()
        lead.hierarchy = HIERARCHY.SECOND_MEETING
      }
      //shortcut to client?
      if(this.status_log == LEAD_STATUS.CLIENT) {
        tag_status = LEAD_STATUS.CLIENT.toLowerCase()
        new_lead_status = LEAD_STATUS.CLIENT

        lead.second_meeting = new Date()
        lead.client = new Date()
        lead.hierarchy = HIERARCHY.CLIENT
      }
    }

    //Hierarchy Client
    if(lead.hierarchy == HIERARCHY.SECOND_MEETING) {
      if(this.status_log == LEAD_STATUS.CLIENT) {
        tag_status = LEAD_STATUS.CLIENT.toLowerCase()
        new_lead_status = LEAD_STATUS.CLIENT

        lead.client = new Date()
        lead.hierarchy = HIERARCHY.CLIENT
      }
    }

    let tag_hierarchy = lead.hierarchy.toLowerCase()
    let new_tag = lead.tags.map(x => (x.tag.includes("[status]") ? {tag: `[status]${tag_status}`}  : x))
    new_tag = lead.tags.map(x => (x.tag.includes("[hierarchy]") ? {tag: `[hierarchy]${tag_hierarchy}`}  : x))
    let lead_update = {
      status: new_lead_status,
      first_meeting: lead.first_meeting,
      second_meeting: lead.second_meeting,
      client: lead.client,
      hierarchy: lead.hierarchy,
      updated_at: new Date(),
      updated_by: this.updated_by,
      tags: new_tag
    }
    // use update to not trigger the pre/post save
    await Lead.findOneAndUpdate({_id: ObjectId(this['lead_id'])}, {$set: lead_update})
  }
  // only uploaded and manual add will go here
  else {
    let new_tag = schemaTagsFormater(lead.tags, this['lead_id'], '_id')
    let lead_update = { tags: new_tag }
    await Lead.findOneAndUpdate({_id: ObjectId(this['lead_id'])}, {$set: lead_update})
  }

  // think of module
  let user = await User.findById(this.updated_by).lean()
  var log_type = this.isNew? LOG_TYPE.CREATE : LOG_TYPE.UPDATE
  var description = logDescriptionFormater(user, log_type, this.status_log, MODULE_PAGES[this['action_page']])
  

  //create a log
  lead_update_log.module = MODULE_PAGES[this['action_page']]
  lead_update_log.lead_id = this['lead_id'],
  lead_update_log.status_log_id = this['_id'],
  lead_update_log.log_type = log_type;
  lead_update_log.description = description;
  lead_update_log.current = current;
  lead_update_log.previous = previous;
  lead_update_log.modified = modified;
  lead_update_log.created_by = this.updated_by;
  await lead_update_log.save();
  next();
});

statusLogSchema.index({ status_log: 1, outcome: 1, lead_id: 1 })
statusLogSchema.index({ status_log: 1, outcome: 1, created_by: 1, datetime: 1 })
statusLogSchema.index({ status_log: 1, created_by: 1, datetime: 1 })

statusLogSchema.static('getLeadMeetings', function (lead_id) {
  return this.find({
    status_log: 'MEETING',
    outcome: 'NEW',
    lead_id: ObjectId(lead_id),
  }).select('_id note datetime address')
})

statusLogSchema.static('getCurrentMeetings', function (user_id, start_date, end_date) {
  return this.find({
    status_log: 'MEETING',
    outcome: 'NEW',
    created_by: ObjectId(user_id),
    datetime: {$gte: start_date, $lte: end_date},
  }).select('_id lead_id').lean()
})

statusLogSchema.plugin(mongoosePaginate)

module.exports = {
  PRODUCTS,
  PROGRAMS,
  StatusLog: mongoose.model('StatusLog', statusLogSchema),
}
