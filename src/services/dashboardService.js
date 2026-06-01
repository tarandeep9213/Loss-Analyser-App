export const dashboardService = {
  getClaimsData: async (
    page,
    rowsPerPage,
    filters = {},
    searchTerm = "",
  ) => {
    try {
      const mockGalleryData = [
        { _id: "1", claim_number: "6900191262-10302025", carrier: "Assurant Flood", policy_number: "6900191262", policy_form: "General Property Form", adjuster_name: "Jabber Albihani", created_at: "2026-04-21T10:59:08Z", status: "Generated", prelim_folder: "", loss_report_name: "1776748853_FINAL REPORT.PDF", report_id: "RPT-1" },
        { _id: "2", claim_number: "545384", carrier: "NA", policy_number: "2557640", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-21T10:13:49Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776746586_FINAL REPORT.PDF", report_id: "RPT-2" },
        { _id: "3", claim_number: "NA", carrier: "NA", policy_number: "NA", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-21T09:41:35Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776744645_FINAL REPORT.PDF", report_id: "RPT-3" },
        { _id: "4", claim_number: "6900051309-08092025", carrier: "NA", policy_number: "6900051309", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-21T05:49:33Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776730592_FINAL REPORT.PDF", report_id: "RPT-4" },
        { _id: "5", claim_number: "NA", carrier: "NA", policy_number: "NA", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-21T05:48:11Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776730589_FINAL REPORT.PDF", report_id: "RPT-5" },
        { _id: "6", claim_number: "552658", carrier: "NA", policy_number: "09-6820625699-00", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-21T02:00:56Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776716910_FINAL REPORT.PDF", report_id: "RPT-6" },
        { _id: "7", claim_number: "6900203063-12102025", carrier: "Assurant Flood", policy_number: "6900203063", policy_form: "General Property Form", adjuster_name: "Jeff Gregory", created_at: "2026-04-21T01:24:42Z", status: "Generated", prelim_folder: "", loss_report_name: "1776714456_FINAL REPORT.PDF", report_id: "RPT-7" },
        { _id: "8", claim_number: "573110", carrier: "NA", policy_number: "8704522224", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-21T01:17:10Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776714339_FINAL REPORT.PDF", report_id: "RPT-8" },
        { _id: "9", claim_number: "7505973975-05/14/2025", carrier: "NA", policy_number: "7505973975", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-22T06:00:04Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776817717_FINAL REPORT.PDF", report_id: "RPT-9" }
      ];

      const response = {
        data: {
          message: mockGalleryData
        }
      };

      // Transform the API response to match our table structure
      let data = response.data.message.map((item) => ({
        id: item._id || Math.random().toString(36).substring(2, 11),
        claimNo: item.claim_number || "",
        carrier: item.carrier || "",
        policyNo: item.policy_number || "",
        policyForm: item.policy_form || "",
        adjusterName: item.adjuster_name || "",
        createdOn: new Date(item.created_at).toLocaleString(),
        status: item.status || "Pending",
        prelim_folder: item.prelim_folder || "",
        originalData: {
          adjuster_name: item.adjuster_name || "",
          carrier: item.carrier || "",
          claim_number: item.claim_number || "",
          created_at: item.created_at || "",
          json_output_s3_path: item.json_output_s3_path || "",
          loss_report_local_folder_path:
            item.loss_report_local_folder_path || "",
          loss_report_name: item.loss_report_name || "",
          loss_report_s3_path: item.loss_report_s3_path || "",
          policy_form: item.policy_form || "",
          policy_number: item.policy_number || "",
          report_id: item.report_id || "",
          status: item.status || "",
          prelim_folder: item.prelim_folder || "",
        },
      }));

      // Apply search term filtering
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(
          (item) =>
            (item.claimNo && item.claimNo.toLowerCase().includes(term)) ||
            (item.carrier && item.carrier.toLowerCase().includes(term)) ||
            (item.policyNo && item.policyNo.toLowerCase().includes(term)) ||
            (item.policyForm && item.policyForm.toLowerCase().includes(term)) ||
            (item.adjusterName &&
              item.adjusterName.toLowerCase().includes(term)) ||
            (item.originalData.loss_report_name &&
              item.originalData.loss_report_name.toLowerCase().includes(term)),
        );
      }

      // Apply advanced filters
      if (filters.carriers && filters.carriers.length > 0) {
        data = data.filter((item) => filters.carriers.includes(item.carrier));
      }

      if (filters.policyForms && filters.policyForms.length > 0) {
        data = data.filter((item) =>
          filters.policyForms.includes(item.policyForm),
        );
      }

      if (filters.adjusters && filters.adjusters.length > 0) {
        data = data.filter((item) =>
          filters.adjusters.includes(item.adjusterName),
        );
      }

      if (filters.statuses && filters.statuses.length > 0) {
        data = data.filter((item) => filters.statuses.includes(item.status));
      }

      if (filters.reportTypes && filters.reportTypes.length > 0) {
        data = data.filter((item) => {
          const reportType = item.prelim_folder ? "Prelim" : "Final";
          return filters.reportTypes.includes(reportType);
        });
      }

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        data = data.filter((item) => new Date(item.createdOn) >= start);
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        data = data.filter((item) => new Date(item.createdOn) <= end);
      }

      // if (filterAllowedStatuses) {
      //   data = data.filter((item) => ALLOWED_STATUSES.includes(item.status));
      // }

      // Calculate pagination values
      const totalCount = data.length;
      const paginatedData = data.slice(
        page * rowsPerPage,
        (page + 1) * rowsPerPage,
      );

      return {
        data: paginatedData,
        totalCount,
      };
    } catch (error) {
      console.error("Error fetching claims data:", error);
      throw error;
    }
  },

  getFilterOptions: async () => {
    try {
      const mockGalleryData = [
        { _id: "1", claim_number: "6900191262-10302025", carrier: "Assurant Flood", policy_number: "6900191262", policy_form: "General Property Form", adjuster_name: "Jabber Albihani", created_at: "2026-04-21T10:59:08Z", status: "Generated", prelim_folder: "", loss_report_name: "1776748853_FINAL REPORT.PDF", report_id: "RPT-1" },
        { _id: "2", claim_number: "545384", carrier: "NA", policy_number: "2557640", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-21T10:13:49Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776746586_FINAL REPORT.PDF", report_id: "RPT-2" },
        { _id: "3", claim_number: "NA", carrier: "NA", policy_number: "NA", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-21T09:41:35Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776744645_FINAL REPORT.PDF", report_id: "RPT-3" },
        { _id: "4", claim_number: "6900051309-08092025", carrier: "NA", policy_number: "6900051309", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-21T05:49:33Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776730592_FINAL REPORT.PDF", report_id: "RPT-4" },
        { _id: "5", claim_number: "NA", carrier: "NA", policy_number: "NA", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-21T05:48:11Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776730589_FINAL REPORT.PDF", report_id: "RPT-5" },
        { _id: "6", claim_number: "552658", carrier: "NA", policy_number: "09-6820625699-00", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-21T02:00:56Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776716910_FINAL REPORT.PDF", report_id: "RPT-6" },
        { _id: "7", claim_number: "6900203063-12102025", carrier: "Assurant Flood", policy_number: "6900203063", policy_form: "General Property Form", adjuster_name: "Jeff Gregory", created_at: "2026-04-21T01:24:42Z", status: "Generated", prelim_folder: "", loss_report_name: "1776714456_FINAL REPORT.PDF", report_id: "RPT-7" },
        { _id: "8", claim_number: "573110", carrier: "NA", policy_number: "8704522224", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-21T01:17:10Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776714339_FINAL REPORT.PDF", report_id: "RPT-8" },
        { _id: "9", claim_number: "7505973975-05/14/2025", carrier: "NA", policy_number: "7505973975", policy_form: "NA", adjuster_name: "NA", created_at: "2026-04-22T06:00:04Z", status: "Request for Additional Payment", prelim_folder: "", loss_report_name: "1776817717_FINAL REPORT.PDF", report_id: "RPT-9" }
      ];

      const response = {
        data: {
          message: mockGalleryData
        }
      };

      // Transform the data
      const data = response.data.message.map((item) => ({
        claimNo: item.claim_number || "",
        carrier: item.carrier || "",
        policyNo: item.policy_number || "",
        policyForm: item.policy_form || "",
        adjusterName: item.adjuster_name || "",
        status: item.status || "Pending",
      }));

      // Extract unique values for filters
      let carriers = [...new Set(data.map((item) => item.carrier))].filter(
        Boolean,
      );
      let policyForms = [
        ...new Set(data.map((item) => item.policyForm)),
      ].filter(Boolean);
      let adjusters = [
        ...new Set(data.map((item) => item.adjusterName)),
      ].filter(Boolean);
      let statuses = [...new Set(data.map((item) => item.status))].filter(
        Boolean,
      );

      // Only include statuses that are in ALLOWED_STATUSES
      //statuses = statuses.filter((status) => ALLOWED_STATUSES.includes(status));

      // Helper to bring 'NA' to the top if present
      const bringNAToTop = (arr) => {
        const idx = arr.findIndex((v) => v === "NA");
        if (idx > -1) {
          arr.splice(idx, 1);
          arr.unshift("NA");
        }
        return arr;
      };

      carriers = bringNAToTop(carriers);
      policyForms = bringNAToTop(policyForms);
      adjusters = bringNAToTop(adjusters);
      statuses = bringNAToTop(statuses);

      return {
        carriers,
        policyForms,
        adjusters,
        statuses,
      };
    } catch (error) {
      console.error("Error fetching filter options:", error);
      throw error;
    }
  },

  getNotifications: async () => {
    return [
      { id: 1, message: "New report generated for CLM-1001", time: "2 hours ago", read: false },
      { id: 2, message: "System maintenance scheduled", time: "1 day ago", read: true }
    ];
  },

  getPropertyFilesData: async (
    page,
    rowsPerPage,
    filters = {},
    searchTerm = "",
  ) => {
    try {
      const response = {
        data: {
          message: [
            { report_id: "P1", policy_type: "Wind Report", loss_report_name: "Wind_Damage_101.pdf", claim_number: "CLM-2001", carrier: "Liberty Mutual", policy_number: "POL-2001", prelim_folder: "Homeowners Form", adjuster_name: "Alice Brown", created_at: "2023-10-05T09:00:00Z", status: "Completed" },
            { report_id: "P2", policy_type: "Hail Report", loss_report_name: "Hail_Damage_102.pdf", claim_number: "CLM-2002", carrier: "Farmers", policy_number: "POL-2002", prelim_folder: "Commercial Form", adjuster_name: "Bob White", created_at: "2023-10-06T14:30:00Z", status: "Pending" }
          ]
        }
      };

      // Transform the API response to match our table structure
      let data = response.data.message.map((item) => ({
        propertyType: item.policy_type || "", // Displays as "Wind Report" or "Hail Report"
        reportName: item.loss_report_name || "",
        claimNo: item.claim_number || "",
        carrier: item.carrier || "",
        policyNo: item.policy_number || "",
        policyForm: item.prelim_folder || "", // From image, matches "Homeowners Form", etc.
        adjusterName: item.adjuster_name || "",
        createdOn: item.created_at
          ? new Date(item.created_at).toLocaleString()
          : "",
        status: item.status || "Pending",

        // Metadata / Hidden fields
        id: item.report_id || Math.random().toString(36).substring(2, 11),
        originalData: {
          ...item,
          // Ensure nested originalData structure remains consistent for your app
          json_output_s3_path: item.json_output_s3_path || "",
          loss_report_s3_path: item.loss_report_s3_path || "",
          report_id: item.report_id || "",
        },
      }));

      // Apply search term filtering
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(
          (item) =>
            (item.claimNo && item.claimNo.toLowerCase().includes(term)) ||
            (item.carrier && item.carrier.toLowerCase().includes(term)) ||
            (item.policyNo && item.policyNo.toLowerCase().includes(term)) ||
            (item.policyForm && item.policyForm.toLowerCase().includes(term)) ||
            (item.adjusterName &&
              item.adjusterName.toLowerCase().includes(term)) ||
            (item.originalData.loss_report_name &&
              item.originalData.loss_report_name.toLowerCase().includes(term)),
        );
      }

      // Apply advanced filters
      if (filters.carriers && filters.carriers.length > 0) {
        data = data.filter((item) => filters.carriers.includes(item.carrier));
      }

      if (filters.policyForms && filters.policyForms.length > 0) {
        data = data.filter((item) =>
          filters.policyForms.includes(item.policyForm),
        );
      }

      if (filters.adjusters && filters.adjusters.length > 0) {
        data = data.filter((item) =>
          filters.adjusters.includes(item.adjusterName),
        );
      }

      if (filters.statuses && filters.statuses.length > 0) {
        data = data.filter((item) => filters.statuses.includes(item.status));
      }

      if (filters.reportTypes && filters.reportTypes.length > 0) {
        const selectedTypes = filters.reportTypes.map((t) => t.toLowerCase());

        data = data.filter(
          (item) =>
            item.propertyType &&
            selectedTypes.includes(item.propertyType.toLowerCase()),
        );
      }

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        data = data.filter((item) => new Date(item.createdOn) >= start);
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        data = data.filter((item) => new Date(item.createdOn) <= end);
      }

      // if (filterAllowedStatuses) {
      //   data = data.filter((item) => ALLOWED_STATUSES.includes(item.status));
      // }

      // Calculate pagination values
      const totalCount = data.length;
      const paginatedData = data.slice(
        page * rowsPerPage,
        (page + 1) * rowsPerPage,
      );

      return {
        data: paginatedData,
        totalCount,
      };
    } catch (error) {
      console.error("Error fetching claims data:", error);
      throw error;
    }
  },

  getPropertyFilterOptions: async () => {
    try {
      const response = {
        data: {
          message: [
            { report_id: "P1", policy_type: "Wind Report", loss_report_name: "Wind_Damage_101.pdf", claim_number: "CLM-2001", carrier: "Liberty Mutual", policy_number: "POL-2001", prelim_folder: "Homeowners Form", adjuster_name: "Alice Brown", created_at: "2023-10-05T09:00:00Z", status: "Completed" },
            { report_id: "P2", policy_type: "Hail Report", loss_report_name: "Hail_Damage_102.pdf", claim_number: "CLM-2002", carrier: "Farmers", policy_number: "POL-2002", prelim_folder: "Commercial Form", adjuster_name: "Bob White", created_at: "2023-10-06T14:30:00Z", status: "Pending" }
          ]
        }
      };

      // Transform the data
      const data = response.data.message.map((item) => ({
        claimNo: item.claim_number || "",
        carrier: item.carrier || "",
        policyNo: item.policy_number || "",
        policyForm: item.policy_form || "",
        adjusterName: item.adjuster_name || "",
        status: item.status || "Pending",
        reportTypes: item.policy_type || "", // "Wind" or "Hail"
      }));

      // Extract unique values for filters
      let carriers = [...new Set(data.map((item) => item.carrier))].filter(
        Boolean,
      );
      let reportTypes = [
        ...new Set(data.map((item) => item.reportTypes?.trim().toUpperCase())),
      ]
        .filter(Boolean)
        .map((type) => type.charAt(0) + type.slice(1).toLowerCase());
      let policyForms = [
        ...new Set(data.map((item) => item.policyForm)),
      ].filter(Boolean);
      let adjusters = [
        ...new Set(data.map((item) => item.adjusterName)),
      ].filter(Boolean);
      let statuses = [...new Set(data.map((item) => item.status))].filter(
        Boolean,
      );

      // Only include statuses that are in ALLOWED_STATUSES
      //statuses = statuses.filter((status) => ALLOWED_STATUSES.includes(status));

      // Helper to bring 'NA' to the top if present
      const bringNAToTop = (arr) => {
        const idx = arr.findIndex((v) => v === "NA");
        if (idx > -1) {
          arr.splice(idx, 1);
          arr.unshift("NA");
        }
        return arr;
      };

      carriers = bringNAToTop(carriers);
      policyForms = bringNAToTop(policyForms);
      adjusters = bringNAToTop(adjusters);
      statuses = bringNAToTop(statuses);
      reportTypes = bringNAToTop(reportTypes);

      return {
        carriers,
        policyForms,
        adjusters,
        statuses,
        reportTypes,
      };
    } catch (error) {
      console.error("Error fetching filter options:", error);
      throw error;
    }
  },
};

export default dashboardService;
