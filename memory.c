#include <stdlib.h>

#include "memory.h"

#include "object.h"
#include "vm.h"

#include <stdio.h>

#ifdef DEBUG_LOG_GC
#include "debug.h"
#endif

void* reallocate(void* pointer, size_t oldSize, size_t newSize) {
    if (newSize > oldSize) {
#ifdef DEBUG_STRESS_GC
        collectGarbage();
#endif
    }

    if (newSize == 0) {
        free(pointer);
        return NULL;
    }

    void* result = realloc(pointer, newSize);
    if (result == NULL)
        exit(1);
    return result;
}

void collectGarbage() {
#ifdef DEBUG_LOG_GC
    printf("-- gc begin\n");
#endif

#ifdef DEBUG_LOG_GC
    printf("-- gc end\n");
#endif
}

static void freeObject(Obj* object) {
#ifdef DEBUG_LOG_GC
    printf("%p free type %d\n", (void*)object, object->type);
#endif
    switch (object->type) {
        case OBJ_STRING:
            ObjString* string = (ObjString*)object;
            FREE_ARRAY(char, string->chars, string->length + 1);
            FREE(ObjString, object);
            break;
        case OBJ_UPVALUE:
            FREE(ObjUpvalue, object);
            break;
        case OBJ_CLOSURE:
            ObjClosure* closure = (ObjClosure*)object;
            FREE_ARRAY(ObjUpvalue*, closure->upvalues, closure->upvalueCount);
            FREE(ObjClosure, closure);
            break;
        case OBJ_FUNCTION:
            ObjFunction* fn = (ObjFunction*)object;
            freeChunk(&fn->chunk);
            FREE(ObjFunction, object);
            break;
        case OBJ_NATIVE:
            FREE(ObjNative, object);
            break;
        default:
            printf("Free not implemented for %d", object->type);
            exit(1);
    }
}

void freeObjects() {
    Obj* current = vm.objects;
    while (current != NULL) {
        Obj* next = current->next;
        freeObject(current);
        current = next;
    }
}