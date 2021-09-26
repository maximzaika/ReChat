export default function IcoClose({ clicked, className }) {
  return (
    <svg viewBox="0 0 72 72" className={className} onClick={clicked}>
      <path d="M14.4 7.78909L36 29.3891L57.6 7.85454C58.0253 7.42182 58.5357 7.08205 59.0991 6.85672C59.6624 6.63139 60.2664 6.5254 60.8727 6.54545C62.0626 6.62245 63.1838 7.1299 64.027 7.97304C64.8701 8.81618 65.3776 9.93738 65.4546 11.1273C65.4605 11.7123 65.3475 12.2925 65.1225 12.8325C64.8974 13.3726 64.5651 13.8613 64.1455 14.2691L42.48 36L64.1455 57.7309C64.9964 58.5556 65.4677 59.6945 65.4546 60.8727C65.3776 62.0626 64.8701 63.1838 64.027 64.027C63.1838 64.8701 62.0626 65.3775 60.8727 65.4545C60.2664 65.4746 59.6624 65.3686 59.0991 65.1433C58.5357 64.9179 58.0253 64.5782 57.6 64.1455L36 42.6109L14.4655 64.1455C14.0402 64.5782 13.5297 64.9179 12.9664 65.1433C12.4031 65.3686 11.7991 65.4746 11.1927 65.4545C9.98065 65.3915 8.83491 64.8816 7.97667 64.0233C7.11843 63.1651 6.60856 62.0194 6.54547 60.8073C6.53955 60.2222 6.65253 59.6421 6.87755 59.102C7.10258 58.5619 7.43497 58.0732 7.85456 57.6655L29.52 36L7.7891 14.2691C7.38133 13.8558 7.06104 13.3646 6.84736 12.8248C6.63369 12.285 6.53101 11.7077 6.54547 11.1273C6.62247 9.93738 7.12992 8.81618 7.97306 7.97304C8.8162 7.1299 9.93739 6.62245 11.1273 6.54545C11.729 6.51687 12.3301 6.61255 12.8931 6.82652C13.4562 7.04048 13.9692 7.36815 14.4 7.78909V7.78909Z" />
    </svg>
  );
}