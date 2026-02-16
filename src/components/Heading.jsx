import React from "react";
import PropTypes from "prop-types";

export default function Heading({ text, alignment = "center", style = {} }) {
  const alignClass = alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center";

  return (
    <h1
      className={`${alignClass} text-[2.5rem] font-bold text-black mb-2`}
      style={style}
    >
      {text}
    </h1>
  );
}

Heading.propTypes = {
  text: PropTypes.string.isRequired,
  alignment: PropTypes.oneOf(["left", "center", "right"]),
  style: PropTypes.object,
};