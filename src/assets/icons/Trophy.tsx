// Carbon Design System "Trophy" icon (32x32). Inlined to avoid pulling
// the entire @carbon/icons-react package for one icon. License: Apache 2.0.
type Props = {
  size?: number;
  className?: string;
};

export function Trophy({ size = 24, className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M27,4H22V2H10V4H5A2,2,0,0,0,3,6v6a4,4,0,0,0,4,4H8.376C9.486,19.011,12.131,21.4,15,21.91V26H10v4h2V28h8v2h2V26H17V21.91c2.869-.51,5.514-2.9,6.624-5.91H25a4,4,0,0,0,4-4V6A2,2,0,0,0,27,4ZM7,14a2,2,0,0,1-2-2V6H8v8Zm9,6a6,6,0,0,1-6-6V4H22V14A6,6,0,0,1,16,20Zm11-8a2,2,0,0,1-2,2H24V6h3Z" />
    </svg>
  );
}
