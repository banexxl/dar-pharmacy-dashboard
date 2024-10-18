export const paths = {
  index: '/',
  auth: {
    auth0: {
      callback: '/auth/auth0/callback',
      login: '/auth/auth0/login',
    },
    jwt: {
      login: '/auth/jwt/login',
      register: '/auth/jwt/register',
    }
  },
  dashboard: {
    index: '/dashboard',
    account: '/dashboard/account',
    analytics: '/dashboard/analytics',
    blank: '/dashboard/blank',
    blog: {
      index: '/dashboard/blog',
      postDetails: '/dashboard/blog/:postId',
      postCreate: '/dashboard/blog/create',
    },
    calendar: '/dashboard/calendar',
    chat: '/dashboard/chat',
    crypto: '/dashboard/crypto',
    customers: {
      index: '/dashboard/customers',
      details: '/dashboard/customers/:customerId',
      edit: '/dashboard/customers/:customerId/edit',
    },
    ecommerce: '/dashboard/ecommerce',
    fileManager: '/dashboard/file-manager',
    invoices: {
      index: '/dashboard/invoices',
      details: '/dashboard/invoices/:orderId',
    },
    jobs: {
      index: '/dashboard/jobs',
      create: '/dashboard/jobs/create',
      companies: {
        details: '/dashboard/jobs/companies/:companyId',
      },
    },
    kanban: '/dashboard/kanban',
    logistics: {
      index: '/dashboard/logistics',
      fleet: '/dashboard/logistics/fleet',
    },
    email: '/dashboard/email',
    orders: {
      index: '/dashboard/orders',
      details: '/dashboard/orders/:orderId',
    },
    products: {
      index: '/dashboard/products',
      create: '/dashboard/products/create',
    },
    social: {
      index: '/dashboard/social',
      profile: '/dashboard/social/profile',
      feed: '/dashboard/social/feed',
    },
  },
  notAuthorized: '/401',
  notFound: '/404',
  serverError: '/500',
};
