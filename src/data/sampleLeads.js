/**
 * Realistic sample lead data for bootstrapping the CRM if local storage is empty.
 * Contains 6 Indian leads across various statuses and sources.
 * 
 * @type {Array<{
 *   id: string,
 *   name: string,
 *   company: string,
 *   email: string,
 *   phone: string,
 *   status: 'New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Won' | 'Lost',
 *   source: 'Website' | 'Referral' | 'LinkedIn' | 'Cold Call' | 'Email Campaign' | 'Other',
 *   createdAt: string
 * }>}
 */
export const sampleLeads = [
  {
    id: 'lead-1',
    name: 'Aarav Sharma',
    company: 'Apex Tech Solutions',
    email: 'aarav.sharma@apextech.in',
    phone: '+91 98765 43210',
    status: 'New',
    source: 'LinkedIn',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'lead-2',
    name: 'Ananya Iyer',
    company: 'Chennai Retail Group',
    email: 'ananya.iyer@chennairetail.com',
    phone: '+91 91234 56789',
    status: 'New',
    source: 'Website',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: 'lead-3',
    name: 'Vikram Malhotra',
    company: 'Mumbai FinTech Services',
    email: 'vikram.m@mumbaifintech.co.in',
    phone: '+91 98123 45670',
    status: 'Contacted',
    source: 'Referral',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
  },
  {
    id: 'lead-4',
    name: 'Priya Patel',
    company: 'Gujarat Agro Industries',
    email: 'priya.patel@gujaratagro.org',
    phone: '+91 94234 56712',
    status: 'Meeting Scheduled',
    source: 'Cold Call',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
  },
  {
    id: 'lead-5',
    name: 'Rohan Verma',
    company: 'Bengaluru Cloud Systems',
    email: 'rohan.verma@bengalurupower.com',
    phone: '+91 80123 45678',
    status: 'Won',
    source: 'Email Campaign',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
  },
  {
    id: 'lead-6',
    name: 'Meera Deshmukh',
    company: 'Pune Logistics Pvt Ltd',
    email: 'meera.d@punelogistics.com',
    phone: '+91 88888 77777',
    status: 'Lost',
    source: 'Other',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
  }
];
