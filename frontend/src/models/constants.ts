import {calculateMonthlyIncrease} from "@/models/models";

export const WEALTH_TAX = {
    FIRST_THRESHOLD: 1_760_000, // 1.76 million NOK
    SECOND_THRESHOLD: 20_700_000, // 20.7 million NOK
    FIRST_RATE: calculateMonthlyIncrease(0.01, true), // 1%
    SECOND_RATE: calculateMonthlyIncrease(0.00575, true), // 1.575%

    // Set wealth tax discount for different asset types
    DISCOUNTS: {
        primaryResidenceMain: 0.75, // 75% discount on  primary residence value
        primaryResidenceOther: 0.30, // 30% discount on primary residence value more than 10 million NOK
        secondaryResidence: 0.0, // no discount on secondary residence value
        stock: 0.2, // 10% discount on stock value
    }
} as const;
