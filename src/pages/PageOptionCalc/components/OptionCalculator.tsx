import React from 'react'
import OptionPricingForm from './OptionPricingForm'
import OptionPricingResult from './OptionPricingResult'

const OptionCalculator: React.FC = () => (
  <>
    <OptionPricingForm />
    <br />
    <div className="p-4 mx-auto rounded-md shadow-lg border-1 max-w-7xl bg-sky-50">
      <OptionPricingResult />
    </div>
  </>
)

export default OptionCalculator
