const ProfileStats = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4 py-4">
    <div className="text-center p-3 bg-rose-50 rounded-lg">
      <div className="text-2xl font-bold text-rose-600">{stats.reviews}</div>
      <div className="text-xs text-rose-600 font-medium">Reviews</div>
    </div>
    <div className="text-center p-3 bg-green-50 rounded-lg">
      <div className="text-2xl font-bold text-green-600">{stats.reports}</div>
      <div className="text-xs text-green-600 font-medium">Reports</div>
    </div>
    <div className="text-center p-3 bg-purple-50 rounded-lg">
      <div className="text-2xl font-bold text-purple-600">{stats.accuracy}%</div>
      <div className="text-xs text-purple-600 font-medium">Accuracy</div>
    </div>
    <div className="text-center p-3 bg-orange-50 rounded-lg">
      <div className="text-2xl font-bold text-orange-600">{stats.hours}</div>
      <div className="text-xs text-orange-600 font-medium">Hours</div>
    </div>
  </div>
);

export default ProfileStats;
