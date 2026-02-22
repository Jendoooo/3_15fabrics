import CollectionForm from '../../_components/CollectionForm';

export default function NewCollectionPage() {
    return (
        <div className="p-5 md:p-8">
            <h1 className="mb-8 text-xl font-light uppercase tracking-widest">Add Collection</h1>
            <CollectionForm />
        </div>
    );
}
