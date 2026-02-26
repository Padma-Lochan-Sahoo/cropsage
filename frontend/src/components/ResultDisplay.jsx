function ResultDisplay({ result }) {
  return (
    <div className="mt-4 w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-4 overflow-x-auto">
      <pre className="whitespace-pre-wrap break-words font-mono text-sm text-slate-100">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

export default ResultDisplay;

