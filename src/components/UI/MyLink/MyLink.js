import { Link } from "react-router-dom";

export default function MyLink({ children, path, className, ...props }) {
  return (
    <Link to={path} className={className}>
      {children}
    </Link>
  );
}
