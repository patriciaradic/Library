import { Star, StarHalf } from "lucide-react";

const StarRating = ({ rating, max = 5 }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;

        if (rating >= starValue) {
          // Full star
          return (
            <Star
              key={starValue}
              size={30}
              style={{color: "orange"}}
            />
          );
        } else if (rating >= starValue - 0.5) {
          // Half star
          return (
            <StarHalf
              key={starValue}
              size={30}
              style={{color: "orange"}}
            />
          );
        }
      })}
    </div>
  );
};

export default StarRating;
