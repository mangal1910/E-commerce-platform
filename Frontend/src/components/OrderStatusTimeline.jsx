const statusColors = {
  "Order Placed": "bg-blue-500",
  Pending: "bg-yellow-500",
  "Picked Up": "bg-orange-500",
  "In Transit": "bg-purple-500",
  "Delivered to Customer": "bg-green-500",
  "Delivery Closed": "bg-slate-700",
  "Return Requested": "bg-red-400",
  "Return Approved": "bg-red-600",
  "Return Rejected": "bg-slate-500",
};

const OrderStatusTimeline = ({ updates = [], orderStatus, returnStatus }) => (
  <div className="mt-4">
    <p className="mb-2 text-sm font-medium text-slate-700">
      Order: <span className="text-blue-600">{orderStatus}</span>
      {returnStatus && returnStatus !== "None" && (
        <span className="ml-2 text-red-600">· Return: {returnStatus}</span>
      )}
    </p>
    <ol className="relative border-l border-slate-200 pl-4">
      {updates.length === 0 && (
        <li className="text-sm text-slate-500">No tracking updates yet</li>
      )}
      {[...updates].reverse().map((u, i) => (
        <li key={i} className="mb-4 ml-2">
          <span
            className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full ${
              statusColors[u.status] || "bg-slate-400"
            }`}
          />
          <p className="text-sm font-medium text-slate-800">{u.status}</p>
          {u.note && <p className="text-xs text-slate-500">{u.note}</p>}
          <p className="text-xs text-slate-400">
            {new Date(u.updatedAt).toLocaleString()}
            {u.updatedBy && ` · ${u.updatedBy}`}
          </p>
        </li>
      ))}
    </ol>
  </div>
);

export default OrderStatusTimeline;

