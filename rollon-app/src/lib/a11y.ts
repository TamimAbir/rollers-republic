export const a11y = {
  visuallyHidden: 'sr-only',
  
  focusVisible: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md',
};

export const ariaLabels = {
  navigation: {
    main: 'Main navigation',
    mobile: 'Mobile navigation',
    footer: 'Footer navigation',
  },
  actions: {
    search: 'Search products',
    cart: 'Shopping cart',
    menu: 'Open menu',
    close: 'Close',
    filter: 'Filter products',
    sort: 'Sort products',
    login: 'Log in to your account',
    logout: 'Log out',
    register: 'Create an account',
  },
  product: {
    addToCart: 'Add to cart',
    removeFromCart: 'Remove from cart',
    increaseQuantity: 'Increase quantity',
    decreaseQuantity: 'Decrease quantity',
    viewDetails: 'View product details',
  },
  form: {
    required: 'Required field',
    optional: 'Optional field',
    submit: 'Submit form',
    cancel: 'Cancel',
  },
  messages: {
    loading: 'Loading content',
    error: 'Error occurred',
    success: 'Operation successful',
    empty: 'No items found',
  },
};

export const keyboardShortcuts = {
  search: '/',
  cart: 'c',
  menu: 'm',
  close: 'Escape',
};
