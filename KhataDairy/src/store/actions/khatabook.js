export const ADD_KHATABOOK = ' ADD_KHATABOOK';
export const REMOVE_KHATABOOK = 'REMOVE_KHATABOOK';
export const SET_KHATABOOK = 'SET_KHTABOOK';

export const ADD_CUSTOMER = 'ADD_CUSTOMER';
export const SET_CUSTOMER = 'SET_CUSTOMER';

export const SET_ENTRY = 'SET_ENTRY';

export const fetchEntry = loadedEntry => {
  return {
    type: SET_ENTRY,
    entries: loadedEntry,
  };
};

export const fetchKhataBook = loadedKhataBooks => {
  return {
    type: SET_KHATABOOK,
    khatabooks: loadedKhataBooks,
  };
};

export const addKhataBook = (name, id) => {
  return {
    type: ADD_KHATABOOK,
    name: name,
    id: id,
  };
};

export const removeKhataBook = id => {
  return {
    type: REMOVE_KHATABOOK,
    id: id,
  };
};

export const fetchCustomers = loadedCustomers => {
  return {
    type: SET_CUSTOMER,
    customers: loadedCustomers,
  };
};

export const addCustomer = (customerId, name, date) => {
  return {
    type: ADD_CUSTOMER,
    customerData: {
      id: customerId,
      name: name,
      entries: [],
      totalGave: 0,
      totalGot: 0,
      totalAmount: 0,
      date: date,
    },
  };
};
