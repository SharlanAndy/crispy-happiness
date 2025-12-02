import React from 'react';
import PropTypes from 'prop-types';

/**
 * PageHeader - Reusable page header with title and description
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} [props.description] - Page description/subtitle
 */
export default function PageHeader({ title, description }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-honor-sans font-bold text-2xl text-black">{title}</h1>
      {description && <p className="font-honor-sans font-medium text-[#a1abaa] text-lg">{description}</p>}
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string
};
