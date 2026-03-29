import { apiSlice } from "../api/apiSlice";

export const cashApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCashSummary: builder.query({
      query: (params) => ({ url: "/cash/summary", method: "GET", params }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: [{ type: "cash", id: "SUMMARY" }],
    }),

    // ─── Income ──────────────────────────────────────────────
    getIncomes: builder.query({
      query: (params) => ({ url: "/cash/incomes", method: "GET", params }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: [{ type: "cash", id: "INCOMES" }],
    }),
    createIncome: builder.mutation({
      query: (body) => ({ url: "/cash/incomes", method: "POST", body }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: [
        { type: "cash", id: "INCOMES" },
        { type: "cash", id: "SUMMARY" },
      ],
    }),
    updateIncome: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/cash/incomes/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: [
        { type: "cash", id: "INCOMES" },
        { type: "cash", id: "SUMMARY" },
      ],
    }),
    deleteIncome: builder.mutation({
      query: (id) => ({ url: `/cash/incomes/${id}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "cash", id: "INCOMES" },
        { type: "cash", id: "SUMMARY" },
      ],
    }),

    // ─── Expenses ─────────────────────────────────────────────
    getExpenses: builder.query({
      query: (params) => ({ url: "/cash/expenses", method: "GET", params }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: [{ type: "cash", id: "EXPENSES" }],
    }),
    createExpense: builder.mutation({
      query: (body) => ({ url: "/cash/expenses", method: "POST", body }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: [
        { type: "cash", id: "EXPENSES" },
        { type: "cash", id: "SUMMARY" },
      ],
    }),
    updateExpense: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/cash/expenses/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: [
        { type: "cash", id: "EXPENSES" },
        { type: "cash", id: "SUMMARY" },
      ],
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({ url: `/cash/expenses/${id}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "cash", id: "EXPENSES" },
        { type: "cash", id: "SUMMARY" },
      ],
    }),
  }),
});

export const {
  useGetCashSummaryQuery,
  useGetIncomesQuery,
  useCreateIncomeMutation,
  useUpdateIncomeMutation,
  useDeleteIncomeMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = cashApiSlice;

