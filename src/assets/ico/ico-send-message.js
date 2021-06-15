export default function IcoSendMessage({ clicked, className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} onClick={clicked}>
      <path d="M20 4H6C4.897 4 4 4.897 4 6V11H6V8L12.4 12.8C12.5732 12.9297 12.7837 12.9998 13 12.9998C13.2163 12.9998 13.4268 12.9297 13.6 12.8L20 8V17H12V19H20C21.103 19 22 18.103 22 17V6C22 4.897 21.103 4 20 4ZM13 10.75L6.666 6H19.334L13 10.75Z" />
      <path d="M2 12H9V14H2V12ZM4 15H10V17H4V15ZM7 18H11V20H7V18Z" />
    </svg>
  );
}