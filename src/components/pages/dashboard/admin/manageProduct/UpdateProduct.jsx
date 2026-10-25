import FaqEditor from '../FaqEditor';
import Toggle from '../../../../ui/Toggle';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from '../../../../../shell/router';
import { useFetchProductByIdQuery, useUpdateProductMutation } from '../../../../store/products/productsApi';
import TextInput from '../addProduct/TextInput';
import SelectInput from '../addProduct/SelectInput';
import CouponInput from '../addProduct/CouponInput';
import { ORIGINS, CATEGORIES, COLORS, withCurrent } from '../addProduct/productOptions';
import UploadImage from '../addProduct/UploadImage';
import DocumentUploader from '../addProduct/DocumentUploader';

const UpdateProduct = () => {
    const {id} = useParams();
    const navigate =  useNavigate();
    const [product, setProduct] = useState({
        name: '',
        category: '',
        color: '',
        price: '',
        oldPrice: '',
        stock: '',
        warranty: '',
        readyToDispatch: false,
        description: '',
        modelNumber: '', // e.g. ZP-35D: goes into the serial numbers of sold machines
        manufacturer: '',
        origin: '',
        couponCode: '',
        fitsModels: '' // spare parts: machine models, comma separated
    })

    const {data: productData, isLoading: isProductLoading, error: fetchError, refetch} = useFetchProductByIdQuery(id);

    // The machine's photos (the first is the main one); uploads are added to the end
    const [images, setImages] = useState([])
    const [saveError, setSaveError] = useState('')
    const [documents, setDocuments] = useState([])
    const [faqs, setFaqs] = useState([])
    const [flags, setFlags] = useState({ active: true, sellOnline: true })
    const [docsUploading, setDocsUploading] = useState(false)

    const {name, category, color, description, price } = productData?.product || {};
    // Empty number fields stay empty in the form (0 or missing = not set yet)
    const numberOrEmpty = (v) => (Number(v) > 0 ? String(v) : '');

    const [updateProduct, {isLoading:isUpdating, error: updateError}] = useUpdateProductMutation();

    useEffect(()=> {
        if(productData){
            setProduct({
                name: name || '',
                category: category || '',
                color: color || '',
                price: numberOrEmpty(price),
                oldPrice: numberOrEmpty(productData.product?.oldPrice),
                stock: numberOrEmpty(productData.product?.stock),
                warranty: numberOrEmpty(productData.product?.warranty),
                readyToDispatch: !!productData.product?.readyToDispatch,
                description: description || '',
                modelNumber: productData.product?.modelNumber || '',
                manufacturer: productData.product?.manufacturer || '',
                origin: productData.product?.origin || '',
                couponCode: productData.product?.couponCode || '',
                fitsModels: (productData.product?.fitsModels || []).join(', ')
            })
            setImages((productData.product?.images || []).filter(Boolean))
            setDocuments(productData.product?.documents || [])
            setFaqs(productData.product?.faqs || [])
            setFlags({ active: productData.product?.active !== false, sellOnline: productData.product?.sellOnline !== false })
        }
    }, [productData])

    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({
            ...product,
            [name]: value
        });


    };

    const handleSubmit =  async (e) => {
        e.preventDefault();
        setSaveError('');
        if (images.length === 0) {
            setSaveError('Please keep or upload at least one product image.');
            return;
        }

        // Empty price / stock / warranty = not set (price 0 shows "Contact for price")
        const toNumber = (v) => (v === '' || v === null || v === undefined ? 0 : Number(v));
        const updatedProduct = {
            ...product,
            price: toNumber(product.price),
            oldPrice: product.oldPrice === '' ? null : Number(product.oldPrice),
            stock: toNumber(product.stock),
            warranty: toNumber(product.warranty),
            images,
            documents,
            faqs: faqs.filter((f) => f.q.trim() && f.a.trim()),
            ...flags,
        };

        try {
            await updateProduct({id: id, ...updatedProduct}).unwrap();
            alert('Product updated successfully');
            await refetch();
            navigate("/dashboard/manage-products")
        } catch (error) {
            console.error('Failed to update product:', error);
            setSaveError(error?.data?.message || 'The product could not be saved. Please try again.');
        }

    }

    if(isProductLoading) return <div>Loading....</div>
    if(fetchError) return <div>Error fetching product!...</div>
  return (
    <div className='container mx-auto mt-8'>
        <h2 className='text-2xl font-bold mb-6'>Update Product </h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
                <TextInput
                label="Product Name"
                name="name"
                placeholder="Ex: High-Speed Tablet Press"
                value={product.name}
                onChange={handleChange}
                />
                <SelectInput
                    label="Category"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    options={withCurrent(CATEGORIES, product.category)}
                />
                <SelectInput
                    label="Color"
                    name="color"
                    value={product.color}
                    onChange={handleChange}
                    options={withCurrent(COLORS, product.color)}
                />
                <TextInput
                    label="Model number (used in the serial numbers when sold)"
                    name="modelNumber"
                    placeholder="ZP-35D"
                    value={product.modelNumber}
                    onChange={handleChange}
                />
                <TextInput
                    label="Fits machine models (spare parts, comma separated)"
                    name="fitsModels"
                    placeholder="ZP-35D, NJP-1200"
                    value={product.fitsModels}
                    onChange={handleChange}
                />
                <TextInput
                    label="Price (₹) – leave empty to show “Contact for price” with WhatsApp (can be added later)"
                    name="price"
                    type="number"
                    placeholder="50000"
                    value={product.price}
                    onChange={handleChange}
                />
                {/* Can be left empty when adding the machine and filled in here later */}
                <TextInput
                    label="Original Price (₹) – for discount (optional)"
                    name="oldPrice"
                    type="number"
                    placeholder="60000"
                    value={product.oldPrice}
                    onChange={handleChange}
                />
                <TextInput
                    label="Stock Quantity – empty or 0 shows “Made to order” (can be added later)"
                    name="stock"
                    type="number"
                    placeholder="10"
                    value={product.stock}
                    onChange={handleChange}
                />
                <TextInput
                    label="Warranty (months, optional)"
                    name="warranty"
                    type="number"
                    placeholder="24"
                    value={product.warranty}
                    onChange={handleChange}
                />
                <Toggle
                    checked={!!product.readyToDispatch}
                    onChange={(v) => setProduct((p) => ({ ...p, readyToDispatch: v }))}
                    label="Ready to dispatch"
                    description="Available for immediate shipping"
                    tone="green"
                />
                <TextInput
                    label="Manufacturer (who makes the machine)"
                    name="manufacturer"
                    placeholder="PureLine Machinery Pvt. Ltd."
                    value={product.manufacturer}
                    onChange={handleChange}
                />
                <SelectInput
                    label="Origin (made in)"
                    name="origin"
                    value={product.origin}
                    onChange={handleChange}
                    options={withCurrent(ORIGINS, product.origin)}
                />
                <CouponInput value={product.couponCode} onChange={(v) => setProduct((prev) => ({ ...prev, couponCode: v }))} />

                <FaqEditor value={faqs} onChange={setFaqs} />

                <div>
                    <p className='block text-sm font-medium text-gray-700'>Photos (the first one is the main photo)</p>
                    {images.length > 0 ? (
                        <div className='mt-2 flex flex-wrap gap-2'>
                            {images.map((url, i) => (
                                <div key={url + i} className='relative h-20 w-20'>
                                    <img src={url} alt={`${product.name} – photo ${i + 1}`} className='h-full w-full rounded border object-cover' />
                                    <button type='button' onClick={() => setImages((list) => list.filter((_, j) => j !== i))}
                                        aria-label={`Remove photo ${i + 1}`}
                                        className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white hover:bg-red-700'>×</button>
                                </div>
                            ))}
                        </div>
                    ) : <p className='mt-1 text-sm text-red-600'>No photos: upload at least one.</p>}
                </div>
                {/* New uploads are added after the current photos */}
                <UploadImage name="images" setImages={(urls) => setImages((list) => [...list, ...urls])} />
                <div>
                <label htmlFor="description" className='block text-sm font-medium text-gray-700'>Description</label>
                <textarea name="description" id="description"
                className='add-product-InputCSS'
                value={product.description}
                placeholder='Write a product description'
                onChange={handleChange}
                ></textarea>
                </div>

                <div className='grid gap-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4 sm:grid-cols-2'>
                    <Toggle checked={flags.active} onChange={(v) => setFlags((f) => ({ ...f, active: v }))} label='Show on website' description='Off = hidden from shop, search and Google' />
                    <Toggle checked={flags.sellOnline} onChange={(v) => setFlags((f) => ({ ...f, sellOnline: v }))} label='Sell online' description='Off = enquiry only, no Add to cart' />
                </div>

                <DocumentUploader documents={documents} setDocuments={setDocuments} onBusyChange={setDocsUploading} />

                {saveError && <p role='alert' className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{saveError}</p>}
                <div>
                    <button type='submit'
                    className='add-product-btn'
                    disabled={isUpdating || docsUploading}
                    >{isUpdating ? 'Updating...' : docsUploading ? 'Uploading documents...' : 'Update Product'}</button>
                </div>

        </form>
    </div>
  )
}

export default UpdateProduct