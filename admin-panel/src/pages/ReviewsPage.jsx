import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { FiStar, FiFilter } from "react-icons/fi";

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsubscribe = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    getDocs(unsubscribe).then((snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, []);

  const filteredReviews = filter === "all" 
    ? reviews 
    : filter === "high" 
      ? reviews.filter(r => r.rating >= 4)
      : filter === "low"
        ? reviews.filter(r => r.rating <= 2)
        : reviews.filter(r => r.rating === 3);

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : 0;
  const positive = reviews.filter(r => r.rating >= 4).length;
  const negative = reviews.filter(r => r.rating <= 2).length;

  const getRatingStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);
  const getRatingColor = (rating) => rating >= 4 ? "text-green-500" : rating === 3 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reviews Management</h1>
          <p className="text-sm text-gray-600">Monitor and respond to customer feedback</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Average Rating</p>
          <p className="text-xl font-bold text-gray-900">{avgRating}</p>
          <p className="text-xs">{getRatingStars(Math.round(avgRating))}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Total Reviews</p>
          <p className="text-xl font-bold text-gray-900">{reviews.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Positive</p>
          <p className="text-xl font-bold text-green-600">{positive}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Negative</p>
          <p className="text-xl font-bold text-red-600">{negative}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-2"><span className="text-xs font-medium text-gray-600">Filter by Rating</span></div>
        <div className="flex flex-wrap gap-2">
          {[{ key: "all", label: "All Reviews" }, { key: "high", label: "4-5 ★ Positive" }, { key: "3", label: "3 ★ Neutral" }, { key: "low", label: "1-2 ★ Negative" }].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f.key ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200"><FiStar className="w-10 h-10 text-gray-300 mx-auto mb-3" /><h3 className="text-sm font-medium text-gray-900">No reviews found</h3><p className="text-xs text-gray-500">Reviews will appear here when customers leave feedback</p></div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`text-lg ${getRatingColor(review.rating)}`}>{getRatingStars(review.rating)}</div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">{review.userName || "Anonymous"}</p>
                    <p className="text-xs text-gray-500">{review.createdAt?.toDate?.().toLocaleDateString() || "Recent"}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${review.rating >= 4 ? "bg-green-100 text-green-700" : review.rating === 3 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{review.rating}/5</span>
              </div>
              <p className="text-gray-700 mb-2">{review.comment || "No comment"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
