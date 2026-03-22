import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useRef, useCallback, useEffect } from 'react';

const INFO_CARDS = [
    {
        icon: (
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
        label: 'Supported Formats',
        value: 'PDF, PNG, JPG, TIFF',
    },
    {
        icon: (
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
        ),
        label: 'Max Size',
        value: '10 MB per file',
    },
    {
        icon: (
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        label: 'Processing Time',
        value: 'Under 30 seconds',
    },
];

const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'image/webp'];
const MAX_MB = 10;

function formatSize(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function FileRow({ item, onRemove }) {
    const isImage = item.file.type.startsWith('image/');
    const isPdf = item.file.type === 'application/pdf';

    return (
        <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
                {isImage && item.preview ? (
                    <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
                ) : isPdf ? (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-red-50">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="text-[9px] font-bold text-red-500 mt-0.5">PDF</span>
                    </div>
                ) : (
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800 truncate mr-2">{item.file.name}</p>
                    <span className="text-xs text-gray-400 shrink-0">{formatSize(item.file.size)}</span>
                </div>

                {/* Progress bar — shown while uploading or done */}
                {(item.status === 'uploading' || item.status === 'done') && (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-200 ${item.status === 'done' ? 'bg-green-500' : 'bg-indigo-500'}`}
                                style={{ width: `${item.progress ?? 0}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{item.progress ?? 0}%</span>
                    </div>
                )}

                {/* Static badges */}
                {!item.status || item.status === 'ready' ? (
                    item.error
                        ? <span className="text-xs text-red-500 font-medium">{item.error}</span>
                        : <span className="text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-full">Ready</span>
                ) : null}
                {item.status === 'error' && (
                    <span className="text-xs text-red-500 font-medium">{item.error ?? 'Upload failed'}</span>
                )}
            </div>

            {/* Right status + remove */}
            <div className="flex items-center gap-2 shrink-0">
                {item.status === 'done' && (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
                {item.status === 'uploading' && (
                    <svg className="w-4 h-4 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                )}
                <button
                    onClick={() => onRemove(item.id)}
                    disabled={item.status === 'uploading'}
                    className="text-gray-300 hover:text-red-400 disabled:opacity-30 transition"
                    title="Remove"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default function Upload() {
    const { flash } = usePage().props;
    const [dragOver, setDragOver] = useState(false);
    const [items, setItems] = useState([]);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    // Revoke object URLs on unmount
    useEffect(() => {
        return () => items.forEach((i) => i.preview && URL.revokeObjectURL(i.preview));
    }, []);

    const addFiles = useCallback((fileList) => {
        const newItems = Array.from(fileList).map((file) => {
            const tooLarge = file.size > MAX_MB * 1024 * 1024;
            const wrongType = !ACCEPTED.includes(file.type);
            const error = wrongType ? 'Unsupported format' : tooLarge ? `Exceeds ${MAX_MB} MB` : null;
            const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
            return { id: `${file.name}-${file.size}-${Date.now()}`, file, preview, error };
        });
        setItems((prev) => {
            // Deduplicate by name+size
            const existing = new Set(prev.map((i) => `${i.file.name}-${i.file.size}`));
            return [...prev, ...newItems.filter((i) => !existing.has(`${i.file.name}-${i.file.size}`))];
        });
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
    }, [addFiles]);

    const handleFileChange = (e) => {
        addFiles(e.target.files);
        e.target.value = '';
    };

    const removeItem = (id) => {
        setItems((prev) => {
            const item = prev.find((i) => i.id === id);
            if (item?.preview) URL.revokeObjectURL(item.preview);
            return prev.filter((i) => i.id !== id);
        });
    };

    const validItems = items.filter((i) => !i.error);
    const hasErrors = items.some((i) => i.error);

    const updateItem = (id, patch) =>
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

    const handleSubmit = async () => {
        if (validItems.length === 0 || uploading) return;
        setUploading(true);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

        for (const item of validItems) {
            updateItem(item.id, { status: 'uploading', progress: 0 });

            const formData = new FormData();
            formData.append('file', item.file);

            try {
                await window.axios.post(route('invoices.upload.file'), formData, {
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    onUploadProgress: (e) => {
                        const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
                        updateItem(item.id, { progress: pct });
                    },
                });
                updateItem(item.id, { status: 'done', progress: 100 });
            } catch (err) {
                const msg = err?.response?.data?.message
                    ?? err?.response?.data?.errors?.file?.[0]
                    ?? `Error ${err?.response?.status ?? ''}`.trim()
                    ?? 'Upload failed';
                updateItem(item.id, { status: 'error', error: msg });
            }
        }

        setUploading(false);
    };

    return (
        <AppLayout>
            <Head title="Upload Invoice" />

            <div className="px-4 sm:px-6 py-6">
                <div className="w-full space-y-6">

                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Upload Invoice</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Drag & drop or browse your files to upload them.
                        </p>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        className={`
                            h-52 rounded-2xl border-2 border-dashed cursor-pointer
                            flex flex-col items-center justify-center gap-3 transition-all duration-200
                            ${dragOver
                                ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
                                : 'border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40'
                            }
                        `}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.tiff,.webp"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <svg className="w-11 h-11 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 11.095H6.75z" />
                        </svg>
                        <p className="text-base font-bold text-gray-800">Drag & drop your files here</p>
                        <p className="text-sm text-gray-400">or</p>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition"
                        >
                            Browse Files
                        </button>
                        <p className="text-xs text-gray-400">PDF, PNG, JPG, TIFF · Max 10 MB each</p>
                    </div>

                    {/* File List */}
                    {items.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold text-gray-900">
                                    Selected Files
                                    <span className="ml-2 text-gray-400 font-normal">({items.length})</span>
                                </h2>
                                <button
                                    onClick={() => { items.forEach((i) => i.preview && URL.revokeObjectURL(i.preview)); setItems([]); }}
                                    className="text-xs text-gray-400 hover:text-red-400 transition"
                                >
                                    Clear all
                                </button>
                            </div>
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                                {items.map((item) => (
                                    <FileRow key={item.id} item={item} onRemove={removeItem} />
                                ))}
                            </div>
                            {hasErrors && (
                                <p className="mt-2 text-xs text-red-500">
                                    Some files have errors and will be skipped.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Info Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        {INFO_CARDS.map((card) => (
                            <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4">
                                <div className="mb-2">{card.icon}</div>
                                <p className="text-xs font-bold text-gray-800">{card.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{card.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Flash success */}
                    {flash?.success && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {/* CTA */}
                    <div>
                        <button
                            onClick={handleSubmit}
                            disabled={validItems.length === 0 || uploading}
                            className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition shadow-sm"
                        >
                            {uploading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Uploading…
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                    </svg>
                                    Upload & Process {validItems.length > 0 ? `(${validItems.length})` : ''} →
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            Your files are processed securely and never shared.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
