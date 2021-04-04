import KhataBook from '../../models/KhataBook';
import Customer from '../../models/Customer';

import {
  ADD_KHATABOOK,
  REMOVE_KHATABOOK,
  SET_KHATABOOK,
  ADD_CUSTOMER,
  SET_CUSTOMER,
  SET_ENTRY,
} from '../actions/khatabook';

const initialState = {
  khatabooks: [],
  customers: [],
  entries: [],
  totalGot: 0,
  totalGave: 0,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_ENTRY:
      return {
        ...state,
        entries: action.entries,
      };

    case SET_KHATABOOK:
      return {
        ...state,
        khatabooks: action.khatabooks,
      };
    case SET_CUSTOMER:
      return {
        ...state,
        customers: action.customers,
        totalGot: action.customers.reduce(
          (prev, curr) => prev + curr.totalGot,
          0,
        ),
        totalGave: action.customers.reduce(
          (prev, curr) => prev + curr.totalGave,
          0,
        ),
      };
    case ADD_KHATABOOK:
      return {
        ...state,
        khatabooks: state.khatabooks.concat(
          new KhataBook(action.id, action.name),
        ),
      };

    case ADD_CUSTOMER:
      return {
        ...state,
        customers: state.customers.concat(
          new Customer(
            action.customerData.id,
            action.customerData.name,
            action.customerData.entries,
            action.customerData.totalGave,
            action.customerData.totalGot,
            action.customerData.totalAmount,
            action.customerData.date,
          ),
        ),
      };
    case REMOVE_KHATABOOK:
      return {
        ...state,
        khatabooks: state.khatabooks.filter(item => item.id !== action.id),
      };
    default:
      return initialState;
  }
};
