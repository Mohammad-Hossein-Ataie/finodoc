import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { FilterParams } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const q = searchParams.get('q') || '';
    const sortBy = searchParams.get('sortBy') || 'publishDateTimeUtc'; // Default sort
    const sortDir = searchParams.get('sortDir') || 'desc';
    
    // Filters
    const hasPdf = searchParams.get('hasPdf') === 'true';
    const hasExcel = searchParams.get('hasExcel') === 'true';
    const hasAttachment = searchParams.get('hasAttachment') === 'true';
    const hasHtml = searchParams.get('hasHtml') === 'true';
    const hasXbrl = searchParams.get('hasXbrl') === 'true';
    const isEstimate = searchParams.get('isEstimate') === 'true';
    const underSupervision = searchParams.get('underSupervision');
    const symbol = searchParams.get('symbol');
    const companyName = searchParams.get('companyName');
    const letterCode = searchParams.get('letterCode');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const tags = searchParams.get('tags');
    const industryId = searchParams.get('industryId');
    const letterCategoryCode = searchParams.get('letterCategoryCode');
    const publisherTypeCode = searchParams.get('publisherTypeCode');
    const letterTypeId = searchParams.get('letterTypeId');

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME || 'codal_letters');

    const query: any = {};

    // Search
    if (q) {
      // Using regex for flexibility if text index is not present
      // Ideally use $text search if index exists: { $text: { $search: q } }
      const regex = { $regex: q, $options: 'i' };
      query.$or = [
        { symbol: regex },
        { companyName: regex },
        { title: regex },
        { letterCode: regex }
      ];
    }

    // Filters
    if (hasPdf) query.hasPdf = true;
    if (hasExcel) query.hasExcel = true;
    if (hasAttachment) query.hasAttachment = true;
    if (hasHtml) query.hasHtml = true;
    if (hasXbrl) query.hasXbrl = true;
    if (isEstimate) query.isEstimate = true;
    
    if (underSupervision) {
        // Assuming underSupervision is stored as number 0 or 1
        query.underSupervision = parseInt(underSupervision);
    }

    if (symbol) query.symbol = symbol;
    if (companyName) query.companyName = companyName;
    if (letterCode) query.letterCode = letterCode;

    if (tags) {
        const tagIds = tags.split(',').map(id => new ObjectId(id));
        query.tags = { $all: tagIds };
    }

    // New Filters for industry and letter types
    if (industryId) query.industryId = parseInt(industryId);
    if (letterCategoryCode) query.letterCategoryCode = parseInt(letterCategoryCode);
    if (publisherTypeCode) query.publisherTypeCode = parseInt(publisherTypeCode);
    if (letterTypeId) query.letterTypeId = parseInt(letterTypeId);

    // Date Range Filter
    // Prefer publishDateTimeUtc if available, else fetchedAt
    if (dateFrom || dateTo) {
        const dateQuery: any = {};
        if (dateFrom) dateQuery.$gte = new Date(dateFrom);
        if (dateTo) dateQuery.$lte = new Date(dateTo);
        
        // This is tricky because we might have mixed data (some with UTC, some without)
        // For simplicity in this query, we'll check publishDateTimeUtc if it exists, OR fetchedAt
        // But MongoDB $or on ranges can be slow. 
        // Best practice: Run migration first. 
        // Here we will assume migration is done or we fallback to fetchedAt if sortBy is fetchedAt
        
        if (sortBy === 'publishDateTimeUtc') {
             query.publishDateTimeUtc = dateQuery;
        } else {
             query.fetchedAt = dateQuery;
        }
    }

    // Sorting
    let sortOptions: any = {};
    const dir = sortDir === 'asc' ? 1 : -1;
    
    if (sortBy === 'publishDateTimeUtc') {
        // Fallback to fetchedAt if publishDateTimeUtc is missing (handled by migration ideally)
        // But in query sort, we can just sort by the field.
        sortOptions = { publishDateTimeUtc: dir, fetchedAt: dir }; 
    } else {
        sortOptions = { [sortBy]: dir };
    }

    // Pagination
    const skip = (page - 1) * pageSize;

    const [items, totalCount] = await Promise.all([
      collection.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize)
        .project({
            _id: 1,
            tracingNo: 1,
            symbol: 1,
            companyName: 1,
            title: 1,
            letterCode: 1,
            publishDateTimeJalali: 1,
            publishDateTimeUtc: 1,
            fetchedAt: 1,
            hasPdf: 1,
            hasExcel: 1,
            hasHtml: 1,
            hasAttachment: 1,
            hasXbrl: 1,
            underSupervision: 1,
            isEstimate: 1,
            tags: 1
        }) // Projection for list view
        .toArray(),
      collection.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      items,
      page,
      pageSize,
      totalCount,
      totalPages
    });

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
