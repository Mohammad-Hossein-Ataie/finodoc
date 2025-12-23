'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Filter, Loader2 } from 'lucide-react';
import { INDUSTRY_TYPES, LETTER_CATEGORIES, PUBLISHER_STATUS, COMPANY_NATURE, COMPANY_TYPE } from '@/lib/filterConstants';

interface LettersFiltersProps {
  isLoading?: boolean;
}

export default function LettersFilters({ isLoading }: LettersFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for filters
  const [filters, setFilters] = useState({
    symbol: '',
    companyName: '',
    title: '',
    letterCode: '',
    tracingNo: '',
    isEstimate: false,
    underSupervision: false,
    hasPdf: false,
    hasExcel: false,
    hasAttachment: false,
    dateFrom: '',
    dateTo: '',
    industryId: '',
    letterCategoryCode: '',
    publisherTypeCode: '',
    letterTypeId: '',
    publisherStatusId: '',
    companyNatureId: '',
    companyTypeId: '',
  });

  // Compute available publisher types based on selected category
  const availablePublisherTypes = useMemo(() => {
    if (!filters.letterCategoryCode) return [];
    const category = LETTER_CATEGORIES.find(c => c.Code.toString() === filters.letterCategoryCode);
    return category?.PublisherTypes || [];
  }, [filters.letterCategoryCode]);

  // Compute available letter types based on selected publisher
  const availableLetterTypes = useMemo(() => {
    if (!filters.publisherTypeCode) return [];
    const publisherType = availablePublisherTypes.find(p => p.Code.toString() === filters.publisherTypeCode);
    return publisherType?.LetterTypes || [];
  }, [filters.publisherTypeCode, availablePublisherTypes]);

  useEffect(() => {
    setFilters({
      symbol: searchParams.get('symbol') || '',
      companyName: searchParams.get('companyName') || '',
      title: searchParams.get('q') || '',
      letterCode: searchParams.get('letterCode') || '',
      tracingNo: searchParams.get('tracingNo') || '',
      isEstimate: searchParams.get('isEstimate') === 'true',
      underSupervision: searchParams.get('underSupervision') === '1',
      hasPdf: searchParams.get('hasPdf') === 'true',
      hasExcel: searchParams.get('hasExcel') === 'true',
      hasAttachment: searchParams.get('hasAttachment') === 'true',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || '',
      industryId: searchParams.get('industryId') || '',
      letterCategoryCode: searchParams.get('letterCategoryCode') || '',
      publisherTypeCode: searchParams.get('publisherTypeCode') || '',
      letterTypeId: searchParams.get('letterTypeId') || '',
      publisherStatusId: searchParams.get('publisherStatusId') || '',
      companyNatureId: searchParams.get('companyNatureId') || '',
      companyTypeId: searchParams.get('companyTypeId') || '',
    });
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.symbol) params.set('symbol', filters.symbol);
    if (filters.companyName) params.set('companyName', filters.companyName);
    if (filters.title) params.set('q', filters.title);
    if (filters.letterCode) params.set('letterCode', filters.letterCode);
    if (filters.tracingNo) params.set('tracingNo', filters.tracingNo);
    if (filters.isEstimate) params.set('isEstimate', 'true');
    if (filters.underSupervision) params.set('underSupervision', '1');
    if (filters.hasPdf) params.set('hasPdf', 'true');
    if (filters.hasExcel) params.set('hasExcel', 'true');
    if (filters.hasAttachment) params.set('hasAttachment', 'true');
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.industryId) params.set('industryId', filters.industryId);
    if (filters.letterCategoryCode) params.set('letterCategoryCode', filters.letterCategoryCode);
    if (filters.publisherTypeCode) params.set('publisherTypeCode', filters.publisherTypeCode);
    if (filters.letterTypeId) params.set('letterTypeId', filters.letterTypeId);
    if (filters.publisherStatusId) params.set('publisherStatusId', filters.publisherStatusId);
    if (filters.companyNatureId) params.set('companyNatureId', filters.companyNatureId);
    if (filters.companyTypeId) params.set('companyTypeId', filters.companyTypeId);
    
    params.set('page', '1');
    router.push(`/letters?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/letters');
  };

  return (
    <Card className="h-fit bg-white border border-gray-200 shadow-sm">
      <CardHeader className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[#2c3e50] font-bold">
                <Filter className="w-5 h-5" />
                <span>فیلترهای جستجو</span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">نماد:</label>
                <Input 
                    className="h-9 text-sm bg-white" 
                    placeholder="نماد شرکت را جستجو کنید..." 
                    value={filters.symbol}
                    onChange={(e) => setFilters({...filters, symbol: e.target.value})}
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">نام شرکت:</label>
                <Input 
                    className="h-9 text-sm bg-white" 
                    placeholder="نام شرکت را جستجو کنید..." 
                    value={filters.companyName}
                    onChange={(e) => setFilters({...filters, companyName: e.target.value})}
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">نوع صنعت:</label>
                <Select 
                    value={filters.industryId}
                    onChange={(e) => setFilters({...filters, industryId: e.target.value})}
                >
                    <option value="">همه موارد</option>
                    {INDUSTRY_TYPES.map(industry => (
                        <option key={industry.Id} value={industry.Id}>{industry.Name}</option>
                    ))}
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">وضعیت ناشران:</label>
                <Select 
                    value={filters.publisherStatusId}
                    onChange={(e) => setFilters({...filters, publisherStatusId: e.target.value})}
                >
                    <option value="">همه موارد</option>
                    {PUBLISHER_STATUS.map(status => (
                        <option key={status.Id} value={status.Id}>{status.Name}</option>
                    ))}
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">ماهیت شرکت:</label>
                <Select 
                    value={filters.companyNatureId}
                    onChange={(e) => setFilters({...filters, companyNatureId: e.target.value})}
                >
                    <option value="">همه موارد</option>
                    {COMPANY_NATURE.map(nature => (
                        <option key={nature.Id} value={nature.Id}>{nature.Name}</option>
                    ))}
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">نوع شرکت:</label>
                <Select 
                    value={filters.companyTypeId}
                    onChange={(e) => setFilters({...filters, companyTypeId: e.target.value})}
                >
                    <option value="">همه موارد</option>
                    {COMPANY_TYPE.map(type => (
                        <option key={type.Id} value={type.Id}>{type.Name}</option>
                    ))}
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">گروه اطلاعیه:</label>
                <Select 
                    value={filters.letterCategoryCode}
                    onChange={(e) => setFilters({...filters, letterCategoryCode: e.target.value, publisherTypeCode: '', letterTypeId: ''})}
                >
                    <option value="">همه موارد</option>
                    {LETTER_CATEGORIES.map(category => (
                        <option key={category.Code} value={category.Code}>{category.Name}</option>
                    ))}
                </Select>
            </div>
            {filters.letterCategoryCode && availablePublisherTypes.length > 0 && (
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">نوع ناشر:</label>
                    <Select 
                        value={filters.publisherTypeCode}
                        onChange={(e) => setFilters({...filters, publisherTypeCode: e.target.value, letterTypeId: ''})}
                    >
                        <option value="">همه موارد</option>
                        {availablePublisherTypes.map(publisher => (
                            <option key={publisher.Code} value={publisher.Code}>{publisher.Name}</option>
                        ))}
                    </Select>
                </div>
            )}
            {filters.publisherTypeCode && availableLetterTypes.length > 0 && (
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">نوع اطلاعیه:</label>
                    <Select 
                        value={filters.letterTypeId}
                        onChange={(e) => setFilters({...filters, letterTypeId: e.target.value})}
                    >
                        <option value="">همه موارد</option>
                        {availableLetterTypes.map(letterType => (
                            <option key={letterType.Id} value={letterType.Id}>{letterType.Name}</option>
                        ))}
                    </Select>
                </div>
            )}

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">موضوع اطلاعیه:</label>
                <Input 
                    className="h-9 text-sm bg-white" 
                    value={filters.title}
                    onChange={(e) => setFilters({...filters, title: e.target.value})}
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">شماره پیگیری:</label>
                <Input 
                    className="h-9 text-sm bg-white" 
                    value={filters.tracingNo}
                    onChange={(e) => setFilters({...filters, tracingNo: e.target.value})}
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">کد اطلاعیه:</label>
                <Input 
                    className="h-9 text-sm bg-white" 
                    value={filters.letterCode}
                    onChange={(e) => setFilters({...filters, letterCode: e.target.value})}
                />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2 border-t">
                <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={filters.hasAttachment}
                        onChange={(e) => setFilters({...filters, hasAttachment: e.target.checked})}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    دارای پیوست
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={filters.hasExcel}
                        onChange={(e) => setFilters({...filters, hasExcel: e.target.checked})}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    دارای اکسل
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={filters.hasPdf}
                        onChange={(e) => setFilters({...filters, hasPdf: e.target.checked})}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    دارای PDF
                </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={filters.underSupervision}
                        onChange={(e) => setFilters({...filters, underSupervision: e.target.checked})}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    تحت نظارت
                </label>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t">
                <Button 
                    onClick={handleSearch} 
                    disabled={isLoading}
                    className="w-full bg-[#007bff] hover:bg-[#0056b3] text-white"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            در حال جستجو...
                        </>
                    ) : (
                        'جستجو'
                    )}
                </Button>
                <Button 
                    variant="outline" 
                    onClick={clearFilters} 
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-gray-100"
                >
                    پاک کردن
                </Button>
            </div>
      </CardContent>
    </Card>
  );
}
