import React from "react";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import Button from "../Button/Button";

export default function ButtonLoading({
  ariaLabel,
  type,
  loading,
  children,
  disabled,
}) {
  return (
    <Button
      color="primary"
      ariaLabel={ariaLabel}
      className="inline-flex items-center px-4"
      isLoading={loading}
      disabled={disabled}
      type={type}
    >
      <LoadingIndicator
        show={loading}
        size="Small"
        color="White"
        marginLeft="-ml-3"
        marginRight="mr-7"
        marginTop="-mt-1.5"
      />
      {children}
      {loading && "Processing"}
    </Button>
  );
}
