import FaqEditor from '../FaqEditor';
import Toggle from '../../../../ui/Toggle';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from '../../../../../shell/router';
import { useFetchProductByIdQuery, useUpdateProductMutation } from '../../../../store/products/productsApi';
import { useSelector } from 'react-redux';
import TextInput from '../addProduct/TextInput';
import SelectInput from '../addProduct/SelectInput';
import CouponInput from '../addProduct/CouponInput';
import { ORIGINS, CATEGORIES, COLORS, withCurrent } from '../addProduct/productOptions';
import UploadImage from '../addProduct/UploadImage';
import DocumentUploader from '../addProduct/DocumentUploader';

const UpdateProduct = () => {
    const {id} = useParams();
    const navigate =  useNavigate();
    const {user} = useSelector((state) => state.auth)
    const [product, setProduct] = useState({
        name: '',
        category: '',
        color: '',
        price: '',
        description: '',
        image: '',
        modelNumber: '', // e.g. ZP-35D: goes into the serial numbers of sold machines
        manufacturer: '',
        origin: '',
        couponCode: '',
        fitsModels: '' // spare parts: machine models, comma separated
    })

    const {data: productData, isLoading: isProductLoading, error: fetchError, refetch} = useFetchProductByIdQuery(id);

    const [newImage, setNewImage] = useState(null)
    const [documents, setDocuments] = useState([])
    const [faqs, setFaqs] = useState([])
    const [flags, setFlags] = useState({ active: true, sellOnline: true })
    const [docsUploading, setDocsUploading] = useState(false)

    const {name, category, color, description, image: imageURL, price } = productData?.product || {};

    const [updateProduct, {isLoading:isUpdating, error: updateError}] = useUpdateProductMutation();

    useEffect(()=> {
        if(productData){
            setProduct({
                name: name || '',
                category: category || '',
                color: color || '',
                price: price || '',
                description: description || '',
                image: imageURL || '',
                modelNumber: productData.product?.modelNumber || '',
                manufacturer: productData.product?.manufacturer || '',
                origin: productData.product?.origin || '',
                couponCode: productData.product?.couponCode || '',
                fitsModels: (productData.product?.fitsModels || []).join(', ')
            })
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

    const handleImageChange= (image) => {
        setNewImage(image);
    }

    const handleSubmit =  async (e) => {
        e.preventDefault();

        const updatedProduct = {
            ...product,
            image: newImage ? newImage : product.image, 
            documents,
            faqs: faqs.filter((f) => f.q.trim() && f.a.trim()),
            ...flags,
            author: user?._id
        };

        try {
            await updateProduct({id: id, ...updatedProduct}).unwrap();
            alert('Product updated successfully');
            await refetch();
            navigate("/dashboard/manage-products")
        } catch (error) {
            console.error('Failed to update product:', error);
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
                placeholder="Ex: Diamond Earrings"
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
                    label="Price (₹) – leave empty to show “Contact for price” with WhatsApp"
                    name="price"
                    type="number"
                    placeholder="50000"
                    value={product.price}
                    onChange={handleChange}
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

                 <UploadImage
                name="image"
                id="image"
                value={newImage || product.image}
                placeholder='Image'
                setImage={handleImageChange}
                />
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