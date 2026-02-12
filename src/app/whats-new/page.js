"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    FaArrowLeft,
    FaUserShield,
    FaCog,
    FaTools,
    FaUserTag,
    FaEllipsisH,
    FaImage,
    FaTimes,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { whatsNewData } from "@/data/whatsNewData";

const WhatsNew = () => {
    // Default to the first version (latest)
    const [activeVersion, setActiveVersion] = useState(whatsNewData[0]?.id || "");
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);


    const getImageList = (item) => {
        if (!item) return [];
        if (item.images && Array.isArray(item.images) && item.images.length > 0) return item.images;
        if (item.image) return [item.image];
        return [];
    };

    const getBadgeStyle = (type) => {
        switch (type) {
            case 'feature': return 'bg-green-100 text-green-700 border-green-200';
            case 'fix': return 'bg-red-100 text-red-700 border-red-200';
            case 'ui': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'improvement': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'security': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'planned': return 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getBadgeLabel = (type) => {
        switch (type) {
            case 'feature': return '✨ New';
            case 'fix': return '🐛 Fix';
            case 'ui': return '🎨 UI';
            case 'improvement': return '⚡ Better';
            case 'security': return '🛡️ Security';
            case 'planned': return '🎯 Planned';
            default: return 'Update';
        }
    };

    const roleConfig = {
        admin: { icon: FaUserShield, label: 'Admin', color: 'text-red-600' },
        user: { icon: FaUserTag, label: 'User (Team Lead)', color: 'text-emerald-600' },
        qc: { icon: FaCog, label: 'QC Tech', color: 'text-purple-600' },
        operator: { icon: FaTools, label: 'Operator', color: 'text-orange-600' },
        customer: { icon: FaUserTag, label: 'Customer', color: 'text-green-600' },
        other: { icon: FaEllipsisH, label: 'General', color: 'text-gray-600' }
    };

    const currentVersion = whatsNewData.find(v => v.id === activeVersion);

    const handleCardClick = (item) => {
        setSelectedItem(item);
        setSelectedImageIndex(0);
        setIsDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">What's New</h1>
                        <p className="text-gray-500 mt-2 text-lg">Discover the latest features and improvements</p>
                    </div>
                    <Link href="/">
                        <Button variant="outline" size="sm" className="gap-2 h-10 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300">
                            <FaArrowLeft className="w-3 h-3" /> Back to Home
                        </Button>
                    </Link>
                </div>

                {/* Main Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar / Version Tabs */}
                    <div className="w-full lg:w-72 flex-shrink-0 space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Version History</p>
                        {whatsNewData.map((ver) => (
                            <button
                                key={ver.id}
                                onClick={() => setActiveVersion(ver.id)}
                                className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 flex items-center justify-between group flex-wrap gap-2 ${activeVersion === ver.id
                                    ? "bg-white shadow-lg border-2 border-rose-200 ring-2 ring-rose-50"
                                    : "bg-white hover:bg-gray-50 border border-gray-100 text-gray-600 hover:shadow-md"
                                    }`}
                            >
                                <div>
                                    <div className={`font-bold text-lg transition-colors ${activeVersion === ver.id ? "text-rose-600" : "text-gray-700 group-hover:text-rose-500"}`}>
                                        {ver.id}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">{ver.date}</div>
                                    <div className={`text-xs mt-0.5 font-medium ${activeVersion === ver.id ? "text-rose-400" : "text-gray-400"}`}>{ver.label}</div>
                                </div>
                                {ver.isNew && (
                                    <span className="bg-gradient-to-r from-rose-500 to-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse">
                                        LATEST
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Area with Tabs */}
                    <div className="flex-1 min-w-0">
                        {currentVersion ? (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Tabs defaultValue="admin" className="w-full">
                                    <div className="border-b border-gray-100 bg-gray-50/50 px-2 pt-2 sm:px-6 sm:pt-6 overflow-x-auto">
                                        <TabsList className="w-full flex sm:grid sm:grid-cols-5 gap-2 bg-transparent h-auto p-0 min-w-max sm:min-w-0">
                                            {Object.entries(roleConfig).map(([key, config]) => {
                                                const Icon = config.icon;
                                                const count = currentVersion.updates[key]?.length || 0;
                                                return (
                                                    <TabsTrigger
                                                        key={key}
                                                        value={key}
                                                        className="flex flex-col items-center gap-2 py-3 px-4 sm:px-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-gray-200 data-[state=active]:text-rose-600 rounded-t-xl sm:rounded-xl transition-all border border-transparent flex-1"
                                                    >
                                                        <Icon className={`w-5 h-5 ${config.color}`} />
                                                        <div className="text-xs font-semibold whitespace-nowrap">{config.label}</div>
                                                        {count > 0 && (
                                                            <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                {count}
                                                            </span>
                                                        )}
                                                    </TabsTrigger>
                                                );
                                            })}
                                        </TabsList>
                                    </div>

                                    {Object.entries(roleConfig).map(([key, config]) => (
                                        <TabsContent key={key} value={key} className="p-4 sm:p-6 mt-0 bg-white min-h-[400px]">
                                            {currentVersion.updates[key]?.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-4">
                                                    {currentVersion.updates[key].map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => handleCardClick(item)}
                                                            className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-rose-100 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative overflow-hidden"
                                                        >
                                                            {/* Hover gradient effect */}
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                            <div className="flex items-start justify-between mb-3 pl-2">
                                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${getBadgeStyle(item.type)}`}>
                                                                    {getBadgeLabel(item.type)}
                                                                </span>
                                                                {(item.image || (item.images && item.images.length) || item.type === 'planned') && (
                                                                    <div className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-rose-500 transition-colors bg-gray-50 px-2 py-1 rounded-full group-hover:bg-rose-50">
                                                                        <FaImage className="w-3.5 h-3.5" />
                                                                        <span className="font-medium">{item.type === 'planned' ? 'Diagram' : 'Preview'}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors pl-2">
                                                                {item.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 leading-relaxed pl-2 line-clamp-2">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-20 flex flex-col items-center justify-center opacity-60">
                                                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-50 mb-4">
                                                        <Image
                                                            src="/background_pictures/no_updates_illustration.jpg"
                                                            alt="No updates"
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No updates for {config.label} in this version</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
                                Select a version to view details
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center border-t border-gray-200 pt-8">
                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                        <span>© {new Date().getFullYear()} SewerVision AI</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>All rights reserved</span>
                    </p>
                </div>
            </div>

            {/* Enhanced Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-6xl p-0 gap-0 overflow-hidden border-0 bg-white shadow-2xl rounded-2xl">
                    {/* Accessible title for screen readers */}
                    <DialogTitle className="sr-only">
                        What&apos;s New update details
                    </DialogTitle>
                    <div className="flex flex-col md:flex-row h-[85vh] md:h-[70vh]">
                        {/* Left Side - Information / How SewerVision.ai Works */}
                        <div className="w-full md:w-2/5 bg-white p-8 overflow-y-auto relative border-b md:border-b-0 md:border-r border-gray-200">
                            {selectedItem && (
                                <div className="space-y-6 pt-4">
                                    <div>
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${getBadgeStyle(selectedItem.type)}`}>
                                            {getBadgeLabel(selectedItem.type)}
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                                            {selectedItem.title}
                                        </h2>
                                        <p className="text-gray-600 leading-relaxed text-base">
                                            {selectedItem.description}
                                        </p>
                                    </div>

                                    {selectedItem.details && selectedItem.details.length > 0 && (
                                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <FaCog className="w-3 h-3" /> Key Details
                                            </h3>
                                            <ul className="space-y-3">
                                                {selectedItem.details.map((detail, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                                                        <div className="mt-1 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-green-600 text-[10px] font-bold">✓</span>
                                                        </div>
                                                        <span className="leading-snug">{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-gray-200 mt-auto space-y-2">
                                        <p className="text-xs text-gray-400 font-medium">
                                            Included in <span className="text-rose-500">Release {currentVersion.id}</span>
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Learn how SewerVision.ai processes inspection data step‑by‑step on the right.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Side - Update Screenshot / Preview */}
                        <div className="w-full md:w-3/5 bg-gray-50 relative flex items-center justify-center p-8">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />

                            <div className="relative w-full max-w-2xl space-y-4 z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="text-xs font-semibold text-rose-500 uppercase tracking-[0.2em]">
                                            Visual Preview
                                        </p>
                                        <h3 className="text-xl font-bold text-gray-900 mt-1">
                                            {selectedItem?.title || "Update Screenshot"}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Click the image to open a full-screen zoom.
                                        </p>
                                    </div>
                                </div>

                                {(() => {
                                    const imageList = getImageList(selectedItem);
                                    if (imageList.length === 0) return null;
                                    const currentSrc = imageList[selectedImageIndex] ?? imageList[0];
                                    const hasMultiple = imageList.length > 1;
                                    return (
                                        <div className="space-y-3">
                                            <button
                                                type="button"
                                                className="w-full rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-lg group focus:outline-none focus:ring-2 focus:ring-rose-400"
                                                onClick={() =>
                                                    setSelectedItem((prev) =>
                                                        prev ? { ...prev, isZoomed: true } : prev
                                                    )
                                                }
                                            >
                                                <div className="relative w-full h-60 md:h-72 bg-gray-100">
                                                    <Image
                                                        src={currentSrc}
                                                        alt={`${selectedItem?.title || "Update screenshot"} ${hasMultiple ? `(${selectedImageIndex + 1}/${imageList.length})` : ""}`}
                                                        fill
                                                        className="object-contain bg-gray-900/5"
                                                        sizes="(min-width: 1024px) 640px, 100vw"
                                                    />
                                                    <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 text-xs text-white flex items-center gap-1">
                                                        <FaImage className="w-3.5 h-3.5" />
                                                        <span className="font-medium">Click to zoom</span>
                                                        {hasMultiple && (
                                                            <span className="opacity-90">({selectedImageIndex + 1}/{imageList.length})</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                            {hasMultiple && (
                                                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                                    {imageList.map((src, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); }}
                                                            className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${idx === selectedImageIndex ? "border-rose-500 ring-2 ring-rose-200" : "border-gray-200 hover:border-gray-300"}`}
                                                        >
                                                            <Image src={src} alt="" width={56} height={56} className="object-cover w-full h-full" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                                {getImageList(selectedItem).length === 0 ? (
                                    <div className="text-center py-20 flex flex-col items-center justify-center">
                                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                            <Image
                                                src={'/background_pictures/improvement_pictures.jpg'}
                                                alt="No preview available"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Full Screen Zoom Overlay (Image or Diagram) */}
            {selectedItem?.isZoomed && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200"
                    onClick={() => setSelectedItem(prev => ({ ...prev, isZoomed: false }))}
                >
                    <button
                        className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-50 backdrop-blur-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(prev => ({ ...prev, isZoomed: false }));
                        }}
                    >
                        <FaTimes className="w-6 h-6" />
                    </button>

                    <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        {(() => {
                            const imageList = getImageList(selectedItem);
                            const src = imageList[selectedImageIndex] ?? imageList[0];
                            if (!src) return null;
                            const hasMultiple = imageList.length > 1;
                            return (
                                <>
                                    {hasMultiple && (
                                        <button
                                            type="button"
                                            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImageIndex((i) => (i - 1 + imageList.length) % imageList.length);
                                            }}
                                        >
                                            <FaChevronLeft className="w-6 h-6" />
                                        </button>
                                    )}
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={src}
                                            alt={selectedItem?.title || "Update screenshot"}
                                            fill
                                            className="object-contain"
                                            priority
                                        />
                                    </div>
                                    {hasMultiple && (
                                        <button
                                            type="button"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImageIndex((i) => (i + 1) % imageList.length);
                                            }}
                                        >
                                            <FaChevronRight className="w-6 h-6" />
                                        </button>
                                    )}
                                    {hasMultiple && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                                            {imageList.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); }}
                                                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === selectedImageIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"}`}
                                                    aria-label={`Image ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatsNew;