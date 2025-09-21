"use client";

/**
 * useFormStatus
   useFormStatus is a react hook that gives us status information about the last
   form submission. It is good to use in children, kind of like formik useFormikContext I believe

   const status = useFormStatus()
   - pending: a boolean indicating if the parent <form> is currently submitting
   - data: an object containing the form's submission data
   - method: a string (either 'get' or 'post') showing the HTTP method being used
   - action: a reference to the function being called in the action prop of parent form

   useActionState hook:
   - useActionState is a react hook that allows us to update state based on the  
   result of a form submission

   - It is helpful for handling form validation and error messages

   Pending (useFormStatus) vs isPending (useActionState)
   - Both can help us determine if a form is being submitted and let us disable
   the button but there is a difference

   - useFormStatus pending: is specifically for form submission 
   - useActionState isPending: can be used with any Action, not just form submission

   Good rule for when to use which:

   useFormStatus pending: when you are building reusable components that will live inside forms
   useActionState isPending: when you need to keep track of server actions that aren't necessarily
   related to form submission
 */
import { Submit } from "@/component/submit";
import { useActionState } from "react";
import { FormState, createProduct } from "@/actions/products";

export default function AddProductPage() {
  const initialState: FormState = {
    errors: {},
  };

  const [state, formAction] = useActionState(createProduct, initialState);

  return (
    <form className="flex flex-col gap-4 p-4 max-w-96" action={formAction}>
      <div>
        <label className="text-white">
          Title
          <input
            className="block w-full p-2 text-black border rounded bg-white"
            type="text"
            name="title"
          />
        </label>
        {state.errors.title && (
          <p className="text-red-500">{state.errors.title}</p>
        )}
      </div>
      <div>
        <label className="text-white">
          Price
          <input
            className="block w-full p-2 text-black border rounded bg-white"
            type="text"
            name="price"
          />
        </label>
        {state.errors.price && (
          <p className="text-red-500">{state.errors.price}</p>
        )}
      </div>
      <div>
        <label className="text-white">
          description
          <textarea
            className="block w-full p-2 text-black border rounded bg-white"
            name="description"
          />
        </label>
        {state.errors.description && (
          <p className="text-red-500">{state.errors.description}</p>
        )}
      </div>
      <Submit />
    </form>
  );
}
