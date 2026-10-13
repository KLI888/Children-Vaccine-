/**
 * WHO Child Growth Standards (Weight-for-age & Length/Height-for-age)
 * Source: World Health Organization (WHO) Child Growth Standards (2006)
 * Reference: Median (50th percentile), -2SD (underweight threshold), +2SD (overweight threshold)
 */

export interface WhoGrowthPoint {
  month: number;
  // Boys
  boysWeightMedian: number;
  boysWeightMin2SD: number;
  boysWeightPlus2SD: number;
  boysHeightMedian: number;
  // Girls
  girlsWeightMedian: number;
  girlsWeightMin2SD: number;
  girlsWeightPlus2SD: number;
  girlsHeightMedian: number;
}

export const WHO_GROWTH_STANDARDS: WhoGrowthPoint[] = [
  { month: 0, boysWeightMedian: 3.3, boysWeightMin2SD: 2.5, boysWeightPlus2SD: 4.4, boysHeightMedian: 49.9, girlsWeightMedian: 3.2, girlsWeightMin2SD: 2.4, girlsWeightPlus2SD: 4.2, girlsHeightMedian: 49.1 },
  { month: 1, boysWeightMedian: 4.5, boysWeightMin2SD: 3.4, boysWeightPlus2SD: 5.8, boysHeightMedian: 54.7, girlsWeightMedian: 4.2, girlsWeightMin2SD: 3.2, girlsWeightPlus2SD: 5.5, girlsHeightMedian: 53.7 },
  { month: 2, boysWeightMedian: 5.6, boysWeightMin2SD: 4.3, boysWeightPlus2SD: 7.1, boysHeightMedian: 58.4, girlsWeightMedian: 5.1, girlsWeightMin2SD: 3.9, girlsWeightPlus2SD: 6.6, girlsHeightMedian: 57.1 },
  { month: 3, boysWeightMedian: 6.4, boysWeightMin2SD: 5.0, boysWeightPlus2SD: 8.0, boysHeightMedian: 61.4, girlsWeightMedian: 5.8, girlsWeightMin2SD: 4.5, girlsWeightPlus2SD: 7.5, girlsHeightMedian: 59.8 },
  { month: 4, boysWeightMedian: 7.0, boysWeightMin2SD: 5.6, boysWeightPlus2SD: 8.7, boysHeightMedian: 63.9, girlsWeightMedian: 6.4, girlsWeightMin2SD: 5.0, girlsWeightPlus2SD: 8.2, girlsHeightMedian: 62.1 },
  { month: 6, boysWeightMedian: 7.9, boysWeightMin2SD: 6.4, boysWeightPlus2SD: 9.8, boysHeightMedian: 67.6, girlsWeightMedian: 7.3, girlsWeightMin2SD: 5.7, girlsWeightPlus2SD: 9.3, girlsHeightMedian: 65.7 },
  { month: 9, boysWeightMedian: 8.9, boysWeightMin2SD: 7.1, boysWeightPlus2SD: 11.0, boysHeightMedian: 72.0, girlsWeightMedian: 8.2, girlsWeightMin2SD: 6.5, girlsWeightPlus2SD: 10.5, girlsHeightMedian: 70.1 },
  { month: 12, boysWeightMedian: 9.6, boysWeightMin2SD: 7.7, boysWeightPlus2SD: 12.0, boysHeightMedian: 75.7, girlsWeightMedian: 8.9, girlsWeightMin2SD: 7.0, girlsWeightPlus2SD: 11.5, girlsHeightMedian: 74.0 },
  { month: 18, boysWeightMedian: 10.9, boysWeightMin2SD: 8.8, boysWeightPlus2SD: 13.7, boysHeightMedian: 82.3, girlsWeightMedian: 10.2, girlsWeightMin2SD: 8.1, girlsWeightPlus2SD: 13.2, girlsHeightMedian: 80.7 },
  { month: 24, boysWeightMedian: 12.2, boysWeightMin2SD: 9.7, boysWeightPlus2SD: 15.3, boysHeightMedian: 87.8, girlsWeightMedian: 11.5, girlsWeightMin2SD: 9.0, girlsWeightPlus2SD: 14.8, girlsHeightMedian: 86.4 },
  { month: 36, boysWeightMedian: 14.3, boysWeightMin2SD: 11.3, boysWeightPlus2SD: 18.3, boysHeightMedian: 96.1, girlsWeightMedian: 13.9, girlsWeightMin2SD: 10.8, girlsWeightPlus2SD: 18.1, girlsHeightMedian: 95.1 },
  { month: 48, boysWeightMedian: 16.3, boysWeightMin2SD: 12.7, boysWeightPlus2SD: 21.2, boysHeightMedian: 103.3, girlsWeightMedian: 16.1, girlsWeightMin2SD: 12.3, girlsWeightPlus2SD: 21.5, girlsHeightMedian: 102.7 },
  { month: 60, boysWeightMedian: 18.3, boysWeightMin2SD: 14.1, boysWeightPlus2SD: 24.2, boysHeightMedian: 110.0, girlsWeightMedian: 18.2, girlsWeightMin2SD: 13.7, girlsWeightPlus2SD: 24.9, girlsHeightMedian: 109.4 },
];
