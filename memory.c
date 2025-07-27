#include <stdlib.h>

#include "memory.h"

#include "object.h"
#include "vm.h"

#include <stdio.h>

void* reallocate(void* pointer, size_t _oldSize, size_t newSize) {
    if (newSize == 0) {
        free(pointer);
        return NULL;
    }

    void* result = realloc(pointer, newSize);
    if (result == NULL)
        exit(1);
    return result;
}

static void freeObject(Obj* object) {
    switch (object->type) {
        case OBJ_STRING:
            ObjString* string = (ObjString*) object;
            FREE_ARRAY(char, string->chars, string->length + 1);
            FREE(ObjString, object);
            break;
        case OBJ_FUNCTION:
            ObjFunction* fn = (ObjFunction*) object;
            freeChunk(&fn->chunk);
            FREE(ObjFunction, object);
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