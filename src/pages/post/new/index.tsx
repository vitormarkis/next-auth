import { newPostSchema, TNewPostBody } from "@/pages/api/posts/schemas"
import { api } from "@/services/api"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"

type MediaString = Record<string, string>

const NewPost: React.FC = () => {
  const { register, handleSubmit } = useForm<TNewPostBody>()
  const [mediaInput, setMediaInput] = useState<MediaString[]>([
    {
      initial: "",
    },
  ])

  const submitHandler: SubmitHandler<TNewPostBody> = async formData => {
    const arrMediasURL = mediaInput.map(inp => Object.values(inp)[0])
    const { medias_url, text, title, price } = newPostSchema.parse({ ...formData, medias_url: arrMediasURL })
    await api.post("/posts", { medias_url, text, title, price })
    console.log({ medias_url, text, title, price })
  }

  const maxInputs = 5

  const rand = () => {
    return Math.random().toString(36).substring(2, 9)
  }

  const handleNewMediaInputRow = () => {
    if (mediaInput.length >= maxInputs) return
    setMediaInput(old => [...old, { [rand()]: "" }])
  }

  const handleDeleteMediaInputRow = (mediaString?: MediaString) => {
    const [key] = Object.entries(mediaString ?? {})[0]

    setMediaInput(old =>
      old.filter(oldObj => {
        return !(key in oldObj)
      })
    )
  }

  const handleClick = () => {
    api.get("/me").then(res => console.log(res.data))
  }

  return (
    <div
      className="mx-auto min-h-screen w-full max-w-[680px] bg-gray-200 p-6 
    [&_textarea]:border [&_textarea]:border-black
    [&_input]:border [&_input]:border-black
    "
    >
      <button onClick={handleClick} className="px-4 py-2 rounded-full bg-gray-500 text-white">/me</button>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="flex flex-col gap-3"
      >
        <input
          type="text"
          {...register("title")}
          placeholder="title"
        />
        <textarea
          {...register("text")}
          placeholder="text"
        />
        <div>
          {mediaInput.map(obj => {
            const [key] = Object.entries(obj)[0]

            const { [key]: value } = mediaInput.find(arrObj => {
              return key in arrObj
            })!

            const lastInput = mediaInput.at(-1)?.[key] ?? ""

            return (
              <div
                key={key}
                className="flex flex-row gap-2"
              >
                <input
                  type="text"
                  placeholder="URL da mídia..."
                  value={value}
                  onChange={e =>
                    setMediaInput(old =>
                      old.map(oldObj => (key in oldObj ? { ...oldObj, [key]: e.target.value } : oldObj))
                    )
                  }
                />
                {mediaInput.length === 1 && lastInput.length === 0 ? (
                  <></>
                ) : lastInput?.length > 0 && mediaInput.length !== maxInputs ? (
                  <>
                    <RowButton
                      mediaString={obj}
                      onClickHandle={handleNewMediaInputRow}
                      content="Adicionar"
                    />
                    {mediaInput.length > 1 && mediaInput.length <= maxInputs && (
                      <RowButton
                        mediaString={obj}
                        onClickHandle={handleDeleteMediaInputRow}
                        content="Remover"
                      />
                    )}
                  </>
                ) : (
                  <RowButton
                    mediaString={obj}
                    onClickHandle={handleDeleteMediaInputRow}
                    content="Remover"
                  />
                )}

                <pre>{JSON.stringify(obj, null)}</pre>
              </div>
            )
          })}
        </div>
        <input
          type="number"
          step="0.01"
          {...register("price")}
          placeholder="price"
        />
        <button
          className="bg-emerald-500 text-center text-white p-2"
          type="submit"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}

interface RowButtonProps {
  onClickHandle: (mediaString?: MediaString) => void
  mediaString: MediaString
  content: string
}

const RowButton: React.FC<RowButtonProps> = ({ onClickHandle, mediaString, content }) => (
  <button
    type="button"
    onClick={() => (mediaString ? onClickHandle(mediaString) : onClickHandle())}
  >
    {content}
  </button>
)

export default NewPost
