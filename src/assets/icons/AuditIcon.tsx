import React from "react";

const AuditIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  width = "1em",
  height = "1em",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="currentColor"
    className={className}
    {...props}
  >
    <defs>
      <clipPath id="clip-Audit_History...">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
    <g id="Audit_History..." data-name="Audit History..." clipPath="url(#clip-Audit_History...)">
      <g id="Group_120063" data-name="Group 120063">
        <g id="Group_120064" data-name="Group 120064" transform="translate(0 0)">
          <path
            id="Path_137095"
            data-name="Path 137095"
            d="M20.214,3.456a11.845,11.845,0,0,0-16.3-.4L2.663,1.81a.73.73,0,0,0-1.222.349L.02,7.993a.75.75,0,0,0,.9.9L6.752,7.47A.73.73,0,0,0,7.1,6.248L5.73,4.877a9.3,9.3,0,0,1,12.69,13.587l-.349.324a1.271,1.271,0,0,0,.848,2.219,1.249,1.249,0,0,0,.848-.324,3.4,3.4,0,0,0,.424-.424,11.91,11.91,0,0,0,.025-16.8"
            transform="translate(0 0)"
            fill="currentColor"
          />
          <path
            id="Path_137096"
            data-name="Path 137096"
            d="M54.829,82.865l-.474.15a1.282,1.282,0,0,0,.324,2.518,1.458,1.458,0,0,0,.324-.05c.2-.05.4-.125.6-.175a1.255,1.255,0,0,0,.8-1.6,1.209,1.209,0,0,0-1.571-.848"
            transform="translate(-40.1 -62.157)"
            fill="currentColor"
          />
          <path
            id="Path_137097"
            data-name="Path 137097"
            d="M35.789,84.249l-.5-.075a1.271,1.271,0,0,0-.5,2.493,5.4,5.4,0,0,0,.623.1c.05,0,.125.025.2.025a1.242,1.242,0,0,0,1.247-1.1,1.27,1.27,0,0,0-1.072-1.446"
            transform="translate(-25.348 -63.167)"
            fill="currentColor"
          />
          <path
            id="Path_137098"
            data-name="Path 137098"
            d="M18.057,76.142a1.277,1.277,0,0,0-1.6,1.994c.175.125.324.249.5.374a1.3,1.3,0,0,0,.723.224,1.237,1.237,0,0,0,1.047-.548,1.273,1.273,0,0,0-.3-1.77Z"
            transform="translate(-12.003 -56.955)"
            fill="currentColor"
          />
          <path
            id="Path_137099"
            data-name="Path 137099"
            d="M6.136,61.22a1.277,1.277,0,1,0-2.319,1.072c.1.2.175.374.274.573a1.281,1.281,0,0,0,1.122.673,1.328,1.328,0,0,0,.6-.15,1.271,1.271,0,0,0,.524-1.72Z"
            transform="translate(-2.775 -45.399)"
            fill="currentColor"
          />
          <path
            id="Path_137100"
            data-name="Path 137100"
            d="M47.741,28.739l-2.917-1.87V22.232a1.271,1.271,0,0,0-2.543,0v5.335a1.265,1.265,0,0,0,.6,1.072l3.49,2.219a1.321,1.321,0,0,0,.673.2,1.265,1.265,0,0,0,.7-2.319"
            transform="translate(-31.74 -15.735)"
            fill="currentColor"
          />
        </g>
      </g>
    </g>
  </svg>
);

export default AuditIcon;
