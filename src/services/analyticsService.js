export const getLossReductionData = async () => {
  return [
    {
      report_id: 'RPT-1',
      claim_number: 'CLM-1001',
      carrier: 'State Farm',
      no_match_count: 5,
      match_count: 12,
      total_estimate_value: 15000,
      loss_reduction_value: 1200,
      computed_at: '2026-04-20T10:00:00Z'
    },
    {
      report_id: 'RPT-2',
      claim_number: 'CLM-1002',
      carrier: 'Allstate',
      no_match_count: 2,
      match_count: 18,
      total_estimate_value: 22000,
      loss_reduction_value: 450,
      computed_at: '2026-04-21T11:00:00Z'
    }
  ];
};

export const getLossReductionAggregate = async () => {
  return {
    total_claims_processed: 2,
    total_estimate_value: 37000,
    total_loss_reduction_value: 1650,
    total_no_match_flags: 7,
    total_match_flags: 30
  };
};

export const getOperationalStats = async () => {
  return {
    claims_submitted: 150,
    claims_validated: 120,
    unprocessed_count: 30,
    unprocessable_rate: 20,
    avg_warnings: 2.5,
    quality_score: 85,
    active_adjusters: 45,
    carrier_coverage: 12,
    avg_processing_time_seconds: 45,
    processing_n: 120,
    status_breakdown: [
      { status: 'Generated', count: 120 },
      { status: 'Pending', count: 30 }
    ],
    weekly_volume: [
      { label: 'Week 1', gen: 30, total: 40 },
      { label: 'Week 2', gen: 35, total: 45 },
      { label: 'Week 3', gen: 25, total: 30 },
      { label: 'Week 4', gen: 30, total: 35 }
    ],
    top_failed_categories: [
      { category: 'Depreciation', no_match_count: 45 },
      { category: 'Overhead & Profit', no_match_count: 32 }
    ],
    adjuster_performance: [
      { adjuster_name: 'John Doe', claims_count: 15, warnings_count: 4, trend: -5 },
      { adjuster_name: 'Jane Smith', claims_count: 12, warnings_count: 2, trend: 10 }
    ],
    prev_month: {
      claims_submitted: 140,
      claims_validated: 110,
      unprocessable_rate: 21.4,
      avg_warnings: 3.0,
      active_adjusters: 42,
      quality_score: 82,
      carrier_coverage: 10
    }
  };
};