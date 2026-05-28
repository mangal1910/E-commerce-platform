const StarRating = ({ value = 0, onChange, readOnly = false, size = "md" }) => {
  const sizeClass = size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className={`flex gap-1 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`${
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } ${star <= value ? "text-amber-400" : "text-slate-300"}`}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRating;

