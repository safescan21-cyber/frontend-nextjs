import React from 'react'

// A "— Select —" first option: without it the browser shows the first choice while nothing is
// chosen, so the form looked filled in but was empty ("Please fill in all required fields")
const SelectInput = ({ label, name, value, onChange, options, placeholder = '— Select —' }) => {
    return (
        <div>
            <label htmlFor={name} className='block text-sm font-medium text-gray-700'>{label}</label>
            <select name={name} id={name}
            value={value ?? ''}
            onChange={onChange}
            className='add-product-InputCSS'
            >
                <option value='' disabled>{placeholder}</option>
                {
                    options.map((option, index) => (
                        <option key={index} value={option.value}>{option.label}</option>
                    ))
                }
            </select>
        </div>
    )
}

export default SelectInput
