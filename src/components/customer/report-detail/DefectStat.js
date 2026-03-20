'use client';

const DefectStat = ({ label, value, color }) => {
  return (
    <div className="text-center p-3 rounded-lg bg-muted">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

export default DefectStat;
